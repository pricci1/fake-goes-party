import type { Stroke } from "../schemas/index.ts";
import type { DrawSync } from "../interfaces/index.ts";
import type { Unsubscribe } from "../interfaces/index.ts";

export class LocalDrawSync implements DrawSync {
  private strokes: Stroke[] = [];
  private listeners = new Set<(stroke: Stroke) => void>();

  pushStroke(stroke: Stroke): void {
    this.strokes.push(stroke);
    for (const listener of this.listeners) {
      listener(stroke);
    }
  }

  onStroke(listener: (stroke: Stroke) => void): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getStrokes(): Stroke[] {
    return [...this.strokes];
  }

  clear(): void {
    this.strokes = [];
  }
}
