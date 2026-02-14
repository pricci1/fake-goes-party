import { describe, expect, test } from "bun:test";
import { GameContextSchema, GameSnapshotSchema, CardSchema } from "../../schemas/index.ts";

describe("CardSchema", () => {
  test("accepts valid card", () => {
    const result = CardSchema.safeParse({ playerIndex: 1, isFake: false });
    expect(result.success).toBe(true);
  });
});

describe("GameContextSchema", () => {
  const validContext = {
    players: [
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
      { id: "p3", name: "Charlie" },
    ],
    round: 0,
    aiQm: false,
    aiGuessEval: false,
    aiQmLanguage: "English",
    maxDrawRounds: 2,
    winThreshold: 5,
    qmIndex: 0,
    fakeArtistIndex: null,
    category: "",
    title: "",
    cardsRevealed: {},
    votes: {},
    drawRound: 0,
    cards: [],
    scores: [0, 0, 0],
    currentDrawerIdx: 0,
    drawOrder: [],
    fakeCaught: null,
    fakeGuess: "",
    correctGuess: null,
    scoreMessage: "",
    winners: [],
  };

  test("accepts valid context", () => {
    const result = GameContextSchema.safeParse(validContext);
    expect(result.success).toBe(true);
  });

  test("accepts all valid aiQmLanguage values", () => {
    for (const lang of ["English", "Spanish", "French", "Portuguese", "German", "Japanese"]) {
      const result = GameContextSchema.safeParse({ ...validContext, aiQmLanguage: lang });
      expect(result.success).toBe(true);
    }
  });

  test("rejects invalid aiQmLanguage", () => {
    const result = GameContextSchema.safeParse({ ...validContext, aiQmLanguage: "Klingon" });
    expect(result.success).toBe(false);
  });

  test("rejects missing aiQmLanguage", () => {
    const { aiQmLanguage, ...noLang } = validContext;
    const result = GameContextSchema.safeParse(noLang);
    expect(result.success).toBe(false);
  });
});

describe("GameSnapshotSchema", () => {
  test("accepts valid snapshot", () => {
    const result = GameSnapshotSchema.safeParse({
      state: "lobby",
      context: {
        players: [],
        round: 0,
        aiQm: false,
        aiGuessEval: false,
        aiQmLanguage: "English",
        maxDrawRounds: 2,
        winThreshold: 5,
        qmIndex: 0,
        fakeArtistIndex: null,
        category: "",
        title: "",
        cardsRevealed: {},
        votes: {},
        drawRound: 0,
        cards: [],
        scores: [],
        currentDrawerIdx: 0,
        drawOrder: [],
        fakeCaught: null,
        fakeGuess: "",
        correctGuess: null,
        scoreMessage: "",
        winners: [],
      },
    });
    expect(result.success).toBe(true);
  });
});
