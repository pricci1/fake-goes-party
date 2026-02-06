import { describe, expect, test } from "bun:test";
import { StrokeSchema } from "../../schemas/index.ts";

describe("StrokeSchema", () => {
  const validStroke = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    playerIndex: 0,
    color: "#E63946",
    points: [
      { x: 10, y: 20 },
      { x: 11, y: 21, pressure: 0.5 },
    ],
    drawRound: 1 as const,
    timestamp: 1700000000000,
  };

  test("accepts valid stroke", () => {
    const result = StrokeSchema.safeParse(validStroke);
    expect(result.success).toBe(true);
  });

  test("rejects drawRound 3", () => {
    const result = StrokeSchema.safeParse({ ...validStroke, drawRound: 3 });
    expect(result.success).toBe(false);
  });

  test("rejects empty points", () => {
    const result = StrokeSchema.safeParse({ ...validStroke, points: [] });
    expect(result.success).toBe(false);
  });

  test("pressure is optional", () => {
    const stroke = {
      ...validStroke,
      points: [{ x: 1, y: 2 }],
    };
    const result = StrokeSchema.safeParse(stroke);
    expect(result.success).toBe(true);
  });
});
