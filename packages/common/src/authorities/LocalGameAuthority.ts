import { interpret } from "robot3";
import type { GameAuthority, Unsubscribe } from "@fake-goes-party/shared";
import { GameEventSchema } from "@fake-goes-party/shared";
import type { GameEvent, GameSnapshot } from "@fake-goes-party/shared";
import { createGameMachine } from "@fake-goes-party/shared";
import { createInitialContext } from "@fake-goes-party/shared";

export class LocalGameAuthority implements GameAuthority {
  private service;
  private listeners = new Set<(snapshot: GameSnapshot) => void>();

  constructor(initialSnapshot?: GameSnapshot) {
    const ctx = initialSnapshot?.context ?? createInitialContext();
    const { machine, initialContext } = createGameMachine(ctx);
    this.service = interpret(machine, () => {
      this.notifyListeners();
    }, initialContext);

    if (initialSnapshot) {
      const original = this.service.machine;
      this.service.machine = Object.freeze(
        Object.create(original, {
          current: { enumerable: true, value: initialSnapshot.state },
          original: { value: original },
        })
      );
    }
  }

  dispatch(event: GameEvent): void {
    const parsed = GameEventSchema.safeParse(event);
    if (!parsed.success) {
      return;
    }
    const validEvent = parsed.data;

    const currentState = this.service.machine.current;

    if (currentState === "lobby") {
      if (validEvent.type === "ADD_PLAYER") {
        const ctx = this.service.context;
        ctx.players.push(validEvent.player);
        ctx.scores.push(0);
        this.notifyListeners();
        return;
      }
      if (validEvent.type === "REMOVE_PLAYER") {
        const ctx = this.service.context;
        ctx.players.splice(validEvent.playerIndex, 1);
        ctx.scores.splice(validEvent.playerIndex, 1);
        this.notifyListeners();
        return;
      }
      if (validEvent.type === "SET_AI_QM") {
        this.service.context.aiQm = validEvent.enabled;
        this.notifyListeners();
        return;
      }
      if (validEvent.type === "SET_AI_GUESS_EVAL") {
        this.service.context.aiGuessEval = validEvent.enabled;
        this.notifyListeners();
        return;
      }
      if (validEvent.type === "SET_MAX_DRAW_ROUNDS") {
        this.service.context.maxDrawRounds = validEvent.value;
        this.notifyListeners();
        return;
      }
      if (validEvent.type === "SET_WIN_THRESHOLD") {
        this.service.context.winThreshold = validEvent.value;
        this.notifyListeners();
        return;
      }
    }

    this.service.send(validEvent);
  }

  subscribe(listener: (snapshot: GameSnapshot) => void): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): GameSnapshot {
    return {
      state: this.service.machine.current as GameSnapshot["state"],
      context: this.service.context,
    };
  }

  private notifyListeners(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
