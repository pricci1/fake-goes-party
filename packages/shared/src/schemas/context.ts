import { z } from "zod";
import { AI_QM_LANGUAGES } from "../constants/index.ts";
import { PlayerSchema } from "./player.ts";

export const CardSchema = z.object({
  playerIndex: z.number().int().min(0),
  isFake: z.boolean(),
});

export type Card = z.infer<typeof CardSchema>;

export const GameContextSchema = z.object({
  players: z.array(PlayerSchema),
  round: z.number().int().min(0),
  aiQm: z.boolean(),
  aiGuessEval: z.boolean(),
  aiQmLanguage: z.enum(AI_QM_LANGUAGES),
  qmIndex: z.number().int().min(-1),
  fakeArtistIndex: z.number().int().min(0).nullable(),
  category: z.string(),
  title: z.string(),
  cardsRevealed: z.record(z.string(), z.boolean()),
  votes: z.record(z.string(), z.number().int().min(0)),
  maxDrawRounds: z.number().int().min(1),
  winThreshold: z.number().int().min(1),
  drawRound: z.number().int().min(0),
  cards: z.array(CardSchema),
  scores: z.array(z.number().int().min(0)),
  currentDrawerIdx: z.number().int().min(0),
  drawOrder: z.array(z.number().int().min(0)),
  fakeCaught: z.boolean().nullable(),
  fakeGuess: z.string(),
  correctGuess: z.boolean().nullable(),
  scoreMessage: z.string(),
  winners: z.array(PlayerSchema),
});

export type GameContext = z.infer<typeof GameContextSchema>;
