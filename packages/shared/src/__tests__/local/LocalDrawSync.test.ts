import { describe, expect, test } from "bun:test";
import { LocalDrawSync } from "../../local/index.ts";
import type { Stroke } from "../../schemas/index.ts";

function makeStroke(id: string, round: 1 | 2 = 1): Stroke {
  return {
    id,
    playerIndex: 0,
    color: "#E63946",
    points: [{ x: 0, y: 0 }],
    drawRound: round,
    timestamp: Date.now(),
  };
}

describe("LocalDrawSync", () => {
  test("starts with no strokes", () => {
    const sync = new LocalDrawSync();
    expect(sync.getStrokes()).toEqual([]);
  });

  test("pushStroke adds stroke and notifies listeners", () => {
    const sync = new LocalDrawSync();
    const received: Stroke[] = [];
    sync.onStroke((s) => received.push(s));

    const stroke = makeStroke("s1");
    sync.pushStroke(stroke);

    expect(sync.getStrokes()).toEqual([stroke]);
    expect(received).toEqual([stroke]);
  });

  test("unsubscribe stops notifications", () => {
    const sync = new LocalDrawSync();
    const received: Stroke[] = [];
    const unsub = sync.onStroke((s) => received.push(s));

    sync.pushStroke(makeStroke("s1"));
    unsub();
    sync.pushStroke(makeStroke("s2"));

    expect(received.length).toBe(1);
  });

  test("clear removes all strokes", () => {
    const sync = new LocalDrawSync();
    sync.pushStroke(makeStroke("s1"));
    sync.pushStroke(makeStroke("s2"));
    sync.clear();
    expect(sync.getStrokes()).toEqual([]);
  });

  test("getStrokes returns a copy (not a reference)", () => {
    const sync = new LocalDrawSync();
    sync.pushStroke(makeStroke("s1"));
    const strokes = sync.getStrokes();
    strokes.pop();
    expect(sync.getStrokes().length).toBe(1);
  });
});
