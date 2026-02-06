import { describe, expect, test } from "bun:test";
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  MAX_DRAW_ROUNDS,
  WIN_THRESHOLD,
  AVAILABLE_COLORS,
} from "../constants/index.ts";

describe("constants", () => {
  test("MIN_PLAYERS is 3", () => {
    expect(MIN_PLAYERS).toBe(3);
  });

  test("MAX_PLAYERS is 10", () => {
    expect(MAX_PLAYERS).toBe(10);
  });

  test("MAX_DRAW_ROUNDS is 2", () => {
    expect(MAX_DRAW_ROUNDS).toBe(2);
  });

  test("WIN_THRESHOLD is 5", () => {
    expect(WIN_THRESHOLD).toBe(5);
  });

  test("AVAILABLE_COLORS has at least MAX_PLAYERS entries", () => {
    expect(AVAILABLE_COLORS.length).toBeGreaterThanOrEqual(MAX_PLAYERS);
  });

  test("AVAILABLE_COLORS has no duplicates", () => {
    const unique = new Set(AVAILABLE_COLORS);
    expect(unique.size).toBe(AVAILABLE_COLORS.length);
  });
});
