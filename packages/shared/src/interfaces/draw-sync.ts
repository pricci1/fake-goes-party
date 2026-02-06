import type { Stroke } from "../schemas/index.ts";
import type { Unsubscribe } from "./game-authority.ts";

export interface DrawSync {
  pushStroke(stroke: Stroke): void;
  onStroke(listener: (stroke: Stroke) => void): Unsubscribe;
  getStrokes(): Stroke[];
  clear(): void;
}
