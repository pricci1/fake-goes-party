import { describe, expect, test } from "bun:test";
import { tallyVotes, isFakeCaught } from "../../logic/index.ts";

describe("tallyVotes", () => {
  test("counts votes per player index", () => {
    const votes = { "0": 2, "1": 2, "3": 2 };
    const tally = tallyVotes(votes);
    expect(tally).toEqual({ "2": 3 });
  });

  test("handles single voter", () => {
    const votes = { "0": 1 };
    const tally = tallyVotes(votes);
    expect(tally).toEqual({ "1": 1 });
  });

  test("handles all voting for same person", () => {
    const votes = { "0": 3, "1": 3, "2": 3 };
    const tally = tallyVotes(votes);
    expect(tally).toEqual({ "3": 3 });
  });

  test("handles split votes", () => {
    const votes = { "0": 1, "1": 2, "2": 1, "3": 2 };
    const tally = tallyVotes(votes);
    expect(tally).toEqual({ "1": 2, "2": 2 });
  });
});

describe("isFakeCaught", () => {
  test("returns true when fake has unique most votes", () => {
    const votes = { "0": 2, "1": 2, "3": 2 };
    expect(isFakeCaught(votes, 2)).toBe(true);
  });

  test("returns false on tie even if fake is tied", () => {
    const votes = { "0": 1, "1": 2, "2": 1, "3": 2 };
    expect(isFakeCaught(votes, 1)).toBe(false);
  });

  test("returns false when someone else has most votes", () => {
    const votes = { "0": 3, "1": 3, "2": 3 };
    expect(isFakeCaught(votes, 1)).toBe(false);
  });

  test("returns false when nobody votes for fake", () => {
    const votes = { "0": 1, "1": 1 };
    expect(isFakeCaught(votes, 2)).toBe(false);
  });
});
