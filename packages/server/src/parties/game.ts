import type * as Party from "partykit/server";
import { interpret, type Service } from "robot3";
import {
  GameEventSchema,
  createGameMachine,
  createInitialContext,
  type GameSnapshot,
  type GameEvent,
} from "@fake-goes-party/shared";
import type { ServerMessage, ClientMessage } from "./types.ts";
import { AiQmProvider } from "../ai/aiQmProvider.ts";
import { AiGuessEvaluator } from "../ai/aiGuessEvaluator.ts";

type GameMachine = ReturnType<typeof createGameMachine>["machine"];
type GameService = Service<GameMachine>;

export default class GameParty implements Party.Server {
  private service: GameService | null = null;
  private aiQmProvider = new AiQmProvider();
  private previousCategories: string[] = [];
  private aiQmInFlight = false;
  private aiGuessEvaluator = new AiGuessEvaluator();
  private aiGuessEvalInFlight = false;

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection): void | Promise<void> {
    // Initialize machine on first connection
    if (!this.service) {
      const ctx = createInitialContext();
      const { machine, initialContext } = createGameMachine(ctx);
      this.service = interpret(
        machine,
        () => {
          this.broadcastSnapshot();
        },
        initialContext
      );
    }

    // Send current snapshot to newly connected client
    const snapshot = this.getSnapshot();
    conn.send(JSON.stringify({ type: "snapshot", snapshot } as ServerMessage));
  }

  onMessage(message: string, sender: Party.Connection): void | Promise<void> {
    try {
      const clientMsg = JSON.parse(message) as ClientMessage;

      if (clientMsg.type === "event") {
        const parsed = GameEventSchema.safeParse(clientMsg.event);
        if (!parsed.success) {
          sender.send(
            JSON.stringify({
              type: "error",
              error: "Invalid event",
              details: parsed.error,
            })
          );
          return;
        }

        const validEvent = parsed.data;

        // Handle lobby mutations (ADD_PLAYER, REMOVE_PLAYER, SET_AI_QM)
        if (this.service) {
          const currentState = this.service.machine.current;

          if (currentState === "lobby") {
            if (validEvent.type === "ADD_PLAYER") {
              const ctx = this.service.context;
              ctx.players.push(validEvent.player);
              ctx.scores.push(0);
              this.broadcastSnapshot();
              return;
            }
            if (validEvent.type === "REMOVE_PLAYER") {
              const ctx = this.service.context;
              ctx.players.splice(validEvent.playerIndex, 1);
              ctx.scores.splice(validEvent.playerIndex, 1);
              this.broadcastSnapshot();
              return;
            }
            if (validEvent.type === "SET_AI_QM") {
              const ctx = this.service.context;
              ctx.aiQm = validEvent.enabled;
              if (validEvent.language) {
                ctx.aiQmLanguage = validEvent.language;
              }
              this.broadcastSnapshot();
              return;
            }
            if (validEvent.type === "SET_AI_GUESS_EVAL") {
              const ctx = this.service.context;
              ctx.aiGuessEval = validEvent.enabled;
              this.broadcastSnapshot();
              return;
            }
            if (validEvent.type === "SET_MAX_DRAW_ROUNDS") {
              const ctx = this.service.context;
              ctx.maxDrawRounds = validEvent.value;
              this.broadcastSnapshot();
              return;
            }
            if (validEvent.type === "SET_WIN_THRESHOLD") {
              const ctx = this.service.context;
              ctx.winThreshold = validEvent.value;
              this.broadcastSnapshot();
              return;
            }
          }

          // Regular state machine transitions
          this.service.send(validEvent as GameEvent);
        }
      }
    } catch (error) {
      sender.send(
        JSON.stringify({ type: "error", error: "Failed to parse message" })
      );
    }
  }

  private getSnapshot(): GameSnapshot {
    if (!this.service) {
      throw new Error("Service not initialized");
    }
    return {
      state: this.service.machine.current as GameSnapshot["state"],
      context: this.service.context,
    };
  }

  private broadcastSnapshot(): void {
    const snapshot = this.getSnapshot();
    const message: ServerMessage = { type: "snapshot", snapshot };
    this.room.broadcast(JSON.stringify(message));
    this.handleAiQmIfNeeded();
    this.handleAiGuessEvalIfNeeded();
  }

  private handleAiQmIfNeeded(): void {
    if (!this.service) return;
    const currentState = this.service.machine.current;
    const ctx = this.service.context;
    if (currentState !== "categorySelection" || !ctx.aiQm) return;
    if (this.aiQmInFlight) return;

    this.aiQmInFlight = true;

    const tryGenerate = async (retries = 1): Promise<void> => {
      try {
        const result = await this.aiQmProvider.pickCategoryAndTitle({
          playerCount: ctx.players.length,
          previousCategories: this.previousCategories,
          language: ctx.aiQmLanguage,
        });

        this.previousCategories.push(result.category);

        const fakeArtistIndex = Math.floor(
          Math.random() * ctx.players.length
        );

        this.service!.send({
          type: "SET_CATEGORY",
          category: result.category,
          title: result.title,
          fakeArtistIndex,
        } as GameEvent);
      } catch (error) {
        if (retries > 0) {
          await tryGenerate(retries - 1);
        } else {
          // Fallback to hardcoded category
          console.error("AI QM failed, using fallback:", error);
          const fakeArtistIndex = Math.floor(
            Math.random() * ctx.players.length
          );
          this.service!.send({
            type: "SET_CATEGORY",
            category: "Animals",
            title: "Cat",
            fakeArtistIndex,
          } as GameEvent);
        }
      } finally {
        this.aiQmInFlight = false;
      }
    };

    tryGenerate();
  }

  private handleAiGuessEvalIfNeeded(): void {
    if (!this.service) return;
    const currentState = this.service.machine.current;
    const ctx = this.service.context;
    if (currentState !== "aiEvaluateGuess") return;
    if (this.aiGuessEvalInFlight) return;

    this.aiGuessEvalInFlight = true;

    const evaluate = async (): Promise<void> => {
      try {
        const result = await this.aiGuessEvaluator.evaluateGuess({
          title: ctx.title,
          guess: ctx.fakeGuess,
          category: ctx.category,
        });
        this.service!.send({
          type: "AI_GUESS_RESULT",
          correct: result.correct,
        } as GameEvent);
      } catch (error) {
        console.error("AI guess evaluation failed, defaulting to incorrect:", error);
        this.service!.send({
          type: "AI_GUESS_RESULT",
          correct: false,
        } as GameEvent);
      } finally {
        this.aiGuessEvalInFlight = false;
      }
    };

    evaluate();
  }
}
