import { interpret } from "robot3";
import type { GameAuthority, Unsubscribe } from "../interfaces/index.ts";
import { GameEventSchema } from "../schemas/index.ts";
import type { GameEvent, GameSnapshot } from "../schemas/index.ts";
import { createGameMachine } from "../machines/index.ts";
import { createInitialContext } from "../logic/index.ts";

export class LocalGameAuthority implements GameAuthority {
  private service;
  private listeners = new Set<(snapshot: GameSnapshot) => void>();

  constructor(initialSnapshot?: GameSnapshot) {
    const ctx = initialSnapshot?.context ?? createInitialContext();
    const { machine, initialContext } = createGameMachine(ctx);
    this.service = interpret(machine, () => {
      this.notifyListeners();
    }, initialContext);

    // robot3 freezes machine objects, so we can't mutate `current` directly.
    // Instead, derive a new machine (like robot3's internal transitionTo does)
    // with the saved state as `current`.
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
