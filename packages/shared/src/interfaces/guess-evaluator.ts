import type { GuessEvalContext } from "../schemas/index.ts";

export interface GuessEvaluator {
  evaluateGuess(context: GuessEvalContext): Promise<{ correct: boolean }>;
}
