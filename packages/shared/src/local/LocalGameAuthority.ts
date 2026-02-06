import { interpret } from "robot3";
import type { GameAuthority, Unsubscribe } from "../interfaces/index.ts";
import type { GameEvent, GameSnapshot, GameContext } from "../schemas/index.ts";
import { createGameMachine } from "../machines/index.ts";
import { createInitialContext } from "../logic/index.ts";

export class LocalGameAuthority implements GameAuthority {
  private service;
  private listeners = new Set<(snapshot: GameSnapshot) => void>();

  constructor() {
    const ctx = createInitialContext();
    const { machine, initialContext } = createGameMachine(ctx);
    this.service = interpret(machine, () => {
      this.notifyListeners();
    }, initialContext);
  }

  dispatch(event: GameEvent): void {
    const currentState = this.service.machine.current as string;

    if (currentState === "lobby") {
      if (event.type === "ADD_PLAYER") {
        const ctx = this.service.context as GameContext;
        ctx.players.push(event.player);
        ctx.scores.push(0);
        this.notifyListeners();
        return;
      }
      if (event.type === "REMOVE_PLAYER") {
        const ctx = this.service.context as GameContext;
        ctx.players.splice(event.playerIndex, 1);
        ctx.scores.splice(event.playerIndex, 1);
        this.notifyListeners();
        return;
      }
    }

    this.service.send(event as any);
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
      context: this.service.context as GameContext,
    };
  }

  private notifyListeners(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
