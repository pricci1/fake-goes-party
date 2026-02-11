import { describe, expect, test } from "bun:test";
import { createInitialContext, resetRoundContext } from "../../logic/index.ts";

describe("createInitialContext", () => {
  test("creates context with empty defaults", () => {
    const ctx = createInitialContext();
    expect(ctx.players).toEqual([]);
    expect(ctx.round).toBe(0);
    expect(ctx.scores).toEqual([]);
    expect(ctx.fakeArtistIndex).toBeNull();
    expect(ctx.category).toBe("");
    expect(ctx.title).toBe("");
    expect(ctx.cardsRevealed).toEqual({});
    expect(ctx.votes).toEqual({});
    expect(ctx.drawRound).toBe(0);
    expect(ctx.cards).toEqual([]);
    expect(ctx.currentDrawerIdx).toBe(0);
    expect(ctx.drawOrder).toEqual([]);
    expect(ctx.fakeCaught).toBeNull();
    expect(ctx.fakeGuess).toBe("");
    expect(ctx.correctGuess).toBeNull();
    expect(ctx.scoreMessage).toBe("");
    expect(ctx.winners).toEqual([]);
  });
});

describe("resetRoundContext", () => {
  test("resets round-specific fields, preserves players and scores", () => {
    const ctx = createInitialContext();
    ctx.players = [
      { id: "1", name: "A" },
      { id: "2", name: "B" },
      { id: "3", name: "C" },
    ];
    ctx.scores = [2, 1, 0];
    ctx.round = 0;
    ctx.category = "Animals";
    ctx.fakeCaught = true;

    const reset = resetRoundContext(ctx, 1);
    expect(reset.players).toEqual(ctx.players);
    expect(reset.scores).toEqual([2, 1, 0]);
    expect(reset.round).toBe(1);
    expect(reset.category).toBe("");
    expect(reset.title).toBe("");
    expect(reset.fakeArtistIndex).toBeNull();
    expect(reset.cardsRevealed).toEqual({});
    expect(reset.votes).toEqual({});
    expect(reset.fakeCaught).toBeNull();
    expect(reset.fakeGuess).toBe("");
    expect(reset.correctGuess).toBeNull();
    expect(reset.scoreMessage).toBe("");
  });
});
