import { describe, expect, test } from "bun:test";
import { interpret } from "robot3";
import { createGameMachine } from "../../machines/index.ts";
import { createInitialContext } from "../../logic/index.ts";
import type { GameContext } from "../../schemas/index.ts";
import { WIN_THRESHOLD } from "../../constants/index.ts";

type GameService = ReturnType<typeof setup>;

function setup(playerCount = 4) {
  const ctx = createInitialContext();
  for (let i = 0; i < playerCount; i++) {
    ctx.players.push({ id: `p${i}`, name: `Player${i}` });
    ctx.scores.push(0);
  }
  const { machine, initialContext } = createGameMachine(ctx);
  return interpret(machine, () => {}, initialContext);
}

function getState(service: GameService) {
  return service.machine.current;
}

function getCtx(service: GameService): GameContext {
  return service.context as GameContext;
}

describe("gameMachine — lobby", () => {
  test("starts in lobby", () => {
    const s = setup();
    expect(getState(s)).toBe("lobby");
  });

  test("START_GAME with enough players transitions to categorySelection (through setupQM)", () => {
    const s = setup(4);
    s.send({ type: "START_GAME" });
    expect(getState(s)).toBe("categorySelection");
  });

  test("START_GAME with too few players stays in lobby", () => {
    const s = setup(2);
    s.send({ type: "START_GAME" });
    expect(getState(s)).toBe("lobby");
  });
});

describe("gameMachine — category selection", () => {
  test("SET_CATEGORY sets fields and advances to cardDistribution", () => {
    const s = setup(4);
    s.send({ type: "START_GAME" });
    s.send({
      type: "SET_CATEGORY",
      category: "Animals",
      title: "Cat",
      fakeArtistIndex: 2,
    });
    expect(getState(s)).toBe("cardDistribution");
    const ctx = getCtx(s);
    expect(ctx.category).toBe("Animals");
    expect(ctx.title).toBe("Cat");
    expect(ctx.fakeArtistIndex).toBe(2);
    expect(ctx.cards.length).toBeGreaterThan(0);
  });
});

describe("gameMachine — drawing flow", () => {
  function setupToDrawing(playerCount = 4) {
    const s = setup(playerCount);
    s.send({ type: "START_GAME" });
    s.send({
      type: "SET_CATEGORY",
      category: "Animals",
      title: "Cat",
      fakeArtistIndex: 2,
    });
    s.send({ type: "CARDS_REVEALED" });
    s.send({ type: "COLORS_CHOSEN" });
    return s;
  }

  test("enters drawingPhase after COLORS_CHOSEN", () => {
    const s = setupToDrawing();
    expect(getState(s)).toBe("drawingPhase");
    expect(getCtx(s).drawRound).toBe(1);
  });

  test("each MARK_MADE advances drawer, two full rounds end in voting", () => {
    const s = setupToDrawing(4);
    const artistCount = 3; // 4 players - 1 QM
    // Round 1
    for (let i = 0; i < artistCount; i++) {
      expect(getState(s)).toBe("drawingPhase");
      s.send({ type: "MARK_MADE" });
    }
    // Should still be in drawingPhase (round 2 started)
    expect(getState(s)).toBe("drawingPhase");
    expect(getCtx(s).drawRound).toBe(2);
    // Round 2
    for (let i = 0; i < artistCount; i++) {
      expect(getState(s)).toBe("drawingPhase");
      s.send({ type: "MARK_MADE" });
    }
    expect(getState(s)).toBe("voting");
  });
});

describe("gameMachine — voting & scoring", () => {
  function setupToVoting() {
    const s = setup(4);
    s.send({ type: "START_GAME" });
    s.send({
      type: "SET_CATEGORY",
      category: "Animals",
      title: "Cat",
      fakeArtistIndex: 2,
    });
    s.send({ type: "CARDS_REVEALED" });
    s.send({ type: "COLORS_CHOSEN" });
    const artistCount = 3;
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < artistCount; i++) {
        s.send({ type: "MARK_MADE" });
      }
    }
    return s;
  }

  test("fake NOT caught → QM and fake score +2", () => {
    const s = setupToVoting();
    // Nobody votes for player 2 (the fake)
    s.send({
      type: "SUBMIT_VOTES",
      votes: { "1": 3, "2": 3, "3": 1 },
    });
    expect(getState(s)).toBe("scoring");
    const ctx = getCtx(s);
    expect(ctx.fakeCaught).toBe(false);
    expect(ctx.scores[0]).toBe(2); // QM
    expect(ctx.scores[2]).toBe(2); // fake
  });

  test("fake caught, wrong guess → artists score +1", () => {
    const s = setupToVoting();
    // All vote for player 2 (the fake)
    s.send({
      type: "SUBMIT_VOTES",
      votes: { "1": 2, "2": 2, "3": 2 },
    });
    expect(getState(s)).toBe("fakeArtistGuess");
    s.send({ type: "GUESS_TITLE", guess: "Dog" });
    expect(getState(s)).toBe("scoring");
    const ctx = getCtx(s);
    expect(ctx.fakeCaught).toBe(true);
    expect(ctx.correctGuess).toBe(false);
    expect(ctx.scores[1]).toBe(1);
    expect(ctx.scores[3]).toBe(1);
    expect(ctx.scores[0]).toBe(0); // QM
    expect(ctx.scores[2]).toBe(0); // fake
  });

  test("fake caught, correct guess → QM and fake score +2", () => {
    const s = setupToVoting();
    s.send({
      type: "SUBMIT_VOTES",
      votes: { "1": 2, "2": 2, "3": 2 },
    });
    s.send({ type: "GUESS_TITLE", guess: "Cat" });
    expect(getState(s)).toBe("scoring");
    const ctx = getCtx(s);
    expect(ctx.correctGuess).toBe(true);
    expect(ctx.scores[0]).toBe(2);
    expect(ctx.scores[2]).toBe(2);
  });
});

describe("gameMachine — checkWinner & gameOver", () => {
  function driveToScoring(s: GameService, fakeIndex: number) {
    s.send({ type: "START_GAME" });
    s.send({
      type: "SET_CATEGORY",
      category: "Animals",
      title: "Cat",
      fakeArtistIndex: fakeIndex,
    });
    s.send({ type: "CARDS_REVEALED" });
    s.send({ type: "COLORS_CHOSEN" });
    const ctx = getCtx(s);
    const artistCount = ctx.drawOrder.length;
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < artistCount; i++) {
        s.send({ type: "MARK_MADE" });
      }
    }
    // Fake not caught → QM and fake get +2
    s.send({
      type: "SUBMIT_VOTES",
      votes: { "1": 3, "2": 3, "3": 1 },
    });
  }

  test("no winner → next round (setupQM → categorySelection)", () => {
    const s = setup(4);
    driveToScoring(s, 2);
    expect(getState(s)).toBe("scoring");
    s.send({ type: "CONTINUE" });
    expect(getState(s)).toBe("categorySelection");
    expect(getCtx(s).round).toBe(1);
  });

  test("winner reached → gameOver", () => {
    const s = setup(4);
    // Pre-set scores near threshold
    const ctx = getCtx(s);
    ctx.scores = [3, 0, 3, 0];
    driveToScoring(s, 2);
    // QM(0) had 3, gets +2 = 5 → winner
    expect(getState(s)).toBe("scoring");
    s.send({ type: "CONTINUE" });
    expect(getState(s)).toBe("gameOver");
    expect(getCtx(s).winners.length).toBeGreaterThan(0);
  });

  test("PLAY_AGAIN returns to lobby with reset scores", () => {
    const s = setup(4);
    const ctx = getCtx(s);
    ctx.scores = [3, 0, 3, 0];
    driveToScoring(s, 2);
    s.send({ type: "CONTINUE" });
    expect(getState(s)).toBe("gameOver");
    s.send({ type: "PLAY_AGAIN" });
    expect(getState(s)).toBe("lobby");
    expect(getCtx(s).scores.every((s) => s === 0)).toBe(true);
  });
});

describe("gameMachine — determinism", () => {
  test("same events produce same state (no Math.random in machine)", () => {
    function run() {
      const s = setup(4);
      s.send({ type: "START_GAME" });
      s.send({
        type: "SET_CATEGORY",
        category: "Animals",
        title: "Cat",
        fakeArtistIndex: 2,
      });
      return getCtx(s);
    }
    const a = run();
    const b = run();
    expect(a).toEqual(b);
  });
});
