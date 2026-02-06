import { createMachine, state, transition } from "robot3";

export function createDrawingMachine() {
  return createMachine("idle", {
    idle: state(transition("ACTIVATE", "active")),
    active: state(transition("STROKE_END", "locked")),
    locked: state(transition("RESET", "idle")),
  });
}
