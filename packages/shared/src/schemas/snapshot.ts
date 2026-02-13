import { z } from "zod";
import { GameContextSchema } from "./context.ts";

export const GAME_STATES = [
  "lobby",
  "setupQM",
  "categorySelection",
  "cardDistribution",
  "colorSelection",
  "drawingPhase",
  "checkDrawing",
  "voting",
  "evaluateVotes",
  "scoreFakeWins",
  "fakeArtistGuess",
  "evaluateGuess",
  "aiEvaluateGuess",
  "scoring",
  "checkWinner",
  "gameOver",
] as const;

export const GameStateSchema = z.enum(GAME_STATES);
export type GameState = z.infer<typeof GameStateSchema>;

export const GameSnapshotSchema = z.object({
  state: GameStateSchema,
  context: GameContextSchema,
});

export type GameSnapshot = z.infer<typeof GameSnapshotSchema>;
