import { describe, expect, test } from "bun:test";
import { GameEventSchema } from "../../schemas/index.ts";

describe("GameEventSchema", () => {
  test("accepts ADD_PLAYER", () => {
    const result = GameEventSchema.safeParse({
      type: "ADD_PLAYER",
      player: { id: "p1", name: "Alice" },
    });
    expect(result.success).toBe(true);
  });

  test("accepts REMOVE_PLAYER", () => {
    const result = GameEventSchema.safeParse({
      type: "REMOVE_PLAYER",
      playerIndex: 0,
    });
    expect(result.success).toBe(true);
  });

  test("accepts START_GAME", () => {
    const result = GameEventSchema.safeParse({ type: "START_GAME" });
    expect(result.success).toBe(true);
  });

  test("accepts SET_CATEGORY with fakeArtistIndex", () => {
    const result = GameEventSchema.safeParse({
      type: "SET_CATEGORY",
      category: "Animals",
      title: "Cat",
      fakeArtistIndex: 2,
    });
    expect(result.success).toBe(true);
  });

  test("rejects SET_CATEGORY without fakeArtistIndex", () => {
    const result = GameEventSchema.safeParse({
      type: "SET_CATEGORY",
      category: "Animals",
      title: "Cat",
    });
    expect(result.success).toBe(false);
  });

  test("accepts CARDS_REVEALED", () => {
    const result = GameEventSchema.safeParse({
      type: "CARDS_REVEALED",
      playerIndex: 0,
    });
    expect(result.success).toBe(true);
  });

  test("accepts COLORS_CHOSEN", () => {
    const result = GameEventSchema.safeParse({ type: "COLORS_CHOSEN" });
    expect(result.success).toBe(true);
  });

  test("accepts MARK_MADE", () => {
    const result = GameEventSchema.safeParse({ type: "MARK_MADE" });
    expect(result.success).toBe(true);
  });

  test("accepts SUBMIT_VOTES", () => {
    const result = GameEventSchema.safeParse({
      type: "SUBMIT_VOTES",
      voterIndex: 0,
      votedForIndex: 2,
    });
    expect(result.success).toBe(true);
  });

  test("rejects SUBMIT_VOTES with legacy vote map", () => {
    const result = GameEventSchema.safeParse({
      type: "SUBMIT_VOTES",
      votes: { "0": 2, "1": 2 },
    });
    expect(result.success).toBe(false);
  });

  test("accepts GUESS_TITLE", () => {
    const result = GameEventSchema.safeParse({
      type: "GUESS_TITLE",
      guess: "Cat",
    });
    expect(result.success).toBe(true);
  });

  test("accepts CONTINUE", () => {
    const result = GameEventSchema.safeParse({ type: "CONTINUE" });
    expect(result.success).toBe(true);
  });

  test("accepts PLAY_AGAIN", () => {
    const result = GameEventSchema.safeParse({ type: "PLAY_AGAIN" });
    expect(result.success).toBe(true);
  });

  test("accepts SET_AI_QM", () => {
    const result = GameEventSchema.safeParse({
      type: "SET_AI_QM",
      enabled: true,
    });
    expect(result.success).toBe(true);
  });

  test("rejects SET_AI_QM without enabled", () => {
    const result = GameEventSchema.safeParse({
      type: "SET_AI_QM",
    });
    expect(result.success).toBe(false);
  });

  test("rejects unknown event type", () => {
    const result = GameEventSchema.safeParse({ type: "EXPLODE" });
    expect(result.success).toBe(false);
  });
});
