import { describe, expect, test } from "bun:test";
import {
  getArtistIndices,
  getArtistIndicesSet,
  getQmIndex,
  findWinners,
} from "../../logic/index.ts";
import type { Player } from "../../schemas/index.ts";

const players: Player[] = [
  { id: "p0", name: "A" },
  { id: "p1", name: "B" },
  { id: "p2", name: "C" },
  { id: "p3", name: "D" },
  { id: "p4", name: "E" },
];

describe("getQmIndex", () => {
  test("rotates QM based on round", () => {
    expect(getQmIndex(0, 5)).toBe(0);
    expect(getQmIndex(1, 5)).toBe(1);
    expect(getQmIndex(5, 5)).toBe(0);
    expect(getQmIndex(7, 5)).toBe(2);
  });
});

describe("getArtistIndices", () => {
  test("returns all indices except QM", () => {
    expect(getArtistIndices(5, 0)).toEqual([1, 2, 3, 4]);
    expect(getArtistIndices(5, 2)).toEqual([0, 1, 3, 4]);
  });

  test("returns a set of all indices except QM", () => {
    const result = getArtistIndicesSet(5, 2);
    expect(result.has(0)).toBe(true);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(false);
    expect(result.has(3)).toBe(true);
    expect(result.has(4)).toBe(true);
  });
});

describe("findWinners", () => {
  test("returns empty if no one meets threshold", () => {
    expect(findWinners([0, 1, 2, 3, 4], players, 5)).toEqual([]);
  });

  test("returns single winner", () => {
    expect(findWinners([0, 0, 6, 0, 0], players, 5)).toEqual([players[2]!]);
  });

  test("returns multiple tied winners", () => {
    const result = findWinners([5, 0, 5, 0, 0], players, 5);
    expect(result).toEqual([players[0]!, players[2]!]);
  });

  test("returns only top scorers if multiple above threshold", () => {
    const result = findWinners([5, 0, 7, 0, 6], players, 5);
    expect(result).toEqual([players[2]!]);
  });
});
