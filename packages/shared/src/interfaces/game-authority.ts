import type { GameEvent, GameSnapshot } from "../schemas/index.ts";

export type Unsubscribe = () => void;

export interface GameAuthority {
  dispatch(event: GameEvent): void;
  subscribe(listener: (snapshot: GameSnapshot) => void): Unsubscribe;
  getSnapshot(): GameSnapshot;
}
