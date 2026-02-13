import type { GameContext } from "../schemas/index.ts";
import { MAX_DRAW_ROUNDS, WIN_THRESHOLD } from "../constants/index.ts";

export function createInitialContext(
  maxDrawRounds = MAX_DRAW_ROUNDS,
  winThreshold = WIN_THRESHOLD,
): GameContext {
  return {
    players: [],
    round: 0,
    aiQm: false,
    aiGuessEval: false,
    maxDrawRounds,
    winThreshold,
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
  };
}

export function resetRoundContext(
  ctx: GameContext,
  nextRound: number
): GameContext {
  return {
    ...ctx,
    round: nextRound,
    aiQm: ctx.aiQm,
    aiGuessEval: ctx.aiGuessEval,
    qmIndex: 0,
    fakeArtistIndex: null,
    category: "",
    title: "",
    cardsRevealed: {},
    votes: {},
    drawRound: 0,
    cards: [],
    currentDrawerIdx: 0,
    drawOrder: [],
    fakeCaught: null,
    fakeGuess: "",
    correctGuess: null,
    scoreMessage: "",
    winners: [],
  };
}
