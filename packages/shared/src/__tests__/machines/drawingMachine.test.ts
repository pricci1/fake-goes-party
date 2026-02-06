import { describe, expect, test } from "bun:test";
import { interpret } from "robot3";
import { createDrawingMachine } from "../../machines/index.ts";

function setup() {
  const machine = createDrawingMachine();
  return interpret(machine, () => {});
}

type DrawingService = ReturnType<typeof setup>;

function getState(service: DrawingService) {
  return service.machine.current;
}

describe("drawingMachine", () => {
  test("starts in idle", () => {
    const s = setup();
    expect(getState(s)).toBe("idle");
  });

  test("ACTIVATE transitions to active", () => {
    const s = setup();
    s.send("ACTIVATE");
    expect(getState(s)).toBe("active");
  });

  test("STROKE_END transitions to locked", () => {
    const s = setup();
    s.send("ACTIVATE");
    s.send("STROKE_END");
    expect(getState(s)).toBe("locked");
  });

  test("RESET transitions locked back to idle", () => {
    const s = setup();
    s.send("ACTIVATE");
    s.send("STROKE_END");
    s.send("RESET");
    expect(getState(s)).toBe("idle");
  });

  test("STROKE_END in idle has no effect", () => {
    const s = setup();
    s.send("STROKE_END");
    expect(getState(s)).toBe("idle");
  });
});
