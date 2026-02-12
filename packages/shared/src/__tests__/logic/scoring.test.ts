import { describe, expect, test } from "bun:test";
import { applyScoring } from "../../logic/index.ts";

describe("applyScoring", () => {
  const baseScores = [0, 0, 0, 0, 0]; // 5 players

  test("fake not caught: QM and fake each get +2", () => {
    const result = applyScoring({
      scores: baseScores,
      qmIndex: 0,
      fakeArtistIndex: 2,
      fakeCaught: false,
      correctGuess: null,
      playerCount: 5,
    });
    expect(result.scores).toEqual([2, 0, 2, 0, 0]);
    expect(result.scoreMessage).toContain("NOT caught");
  });

  test("fake caught, correct guess: QM and fake each get +2", () => {
    const result = applyScoring({
      scores: baseScores,
      qmIndex: 0,
      fakeArtistIndex: 2,
      fakeCaught: true,
      correctGuess: true,
      playerCount: 5,
    });
    expect(result.scores).toEqual([2, 0, 2, 0, 0]);
    expect(result.scoreMessage).toContain("guessed correctly");
  });

  test("fake caught, wrong guess: all artists get +1", () => {
    const result = applyScoring({
      scores: baseScores,
      qmIndex: 0,
      fakeArtistIndex: 2,
      fakeCaught: true,
      correctGuess: false,
      playerCount: 5,
    });
    expect(result.scores).toEqual([0, 1, 0, 1, 1]);
    expect(result.scoreMessage).toContain("Wrong guess");
  });

  test("accumulates on existing scores", () => {
    const result = applyScoring({
      scores: [3, 1, 2, 0, 1],
      qmIndex: 1,
      fakeArtistIndex: 3,
      fakeCaught: false,
      correctGuess: null,
      playerCount: 5,
    });
    expect(result.scores).toEqual([3, 3, 2, 2, 1]);
  });
});

describe("applyScoring — AI QM (qmIndex = -1)", () => {
  const baseScores = [0, 0, 0, 0, 0];

  test("fake not caught: only fake gets +2, no QM points", () => {
    const result = applyScoring({
      scores: baseScores,
      qmIndex: -1,
      fakeArtistIndex: 2,
      fakeCaught: false,
      correctGuess: null,
      playerCount: 5,
    });
    expect(result.scores).toEqual([0, 0, 2, 0, 0]);
    expect(result.scoreMessage).not.toContain("QM");
  });

  test("fake caught, correct guess: only fake gets +2", () => {
    const result = applyScoring({
      scores: baseScores,
      qmIndex: -1,
      fakeArtistIndex: 2,
      fakeCaught: true,
      correctGuess: true,
      playerCount: 5,
    });
    expect(result.scores).toEqual([0, 0, 2, 0, 0]);
    expect(result.scoreMessage).not.toContain("QM");
  });

  test("fake caught, wrong guess: all non-fake artists get +1", () => {
    const result = applyScoring({
      scores: baseScores,
      qmIndex: -1,
      fakeArtistIndex: 2,
      fakeCaught: true,
      correctGuess: false,
      playerCount: 5,
    });
    // qmIndex=-1 excluded nobody, so all except fakeArtistIndex=2 get +1
    expect(result.scores).toEqual([1, 1, 0, 1, 1]);
  });
});
