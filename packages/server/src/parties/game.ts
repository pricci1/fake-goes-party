import type * as Party from "partykit/server";
import { interpret } from "robot3";
import {
  GameEventSchema,
  createGameMachine,
  createInitialContext,
  type GameSnapshot,
  type GameEvent,
} from "@fake-goes-party/shared";
import type { ServerMessage, ClientMessage } from "./types.ts";

export default class GameParty implements Party.Server {
  private service: ReturnType<typeof interpret> | null = null;

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

        // Handle lobby mutations (ADD_PLAYER, REMOVE_PLAYER)
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
  }
}
