export interface ScoringInput {
  scores: number[];
  qmIndex: number;
  fakeArtistIndex: number;
  fakeCaught: boolean;
  correctGuess: boolean | null;
  playerCount: number;
}

export interface ScoringResult {
  scores: number[];
  scoreMessage: string;
}

export function applyScoring(input: ScoringInput): ScoringResult {
  const scores = [...input.scores];
  const hasHumanQm = input.qmIndex >= 0;

  if (!input.fakeCaught) {
    if (hasHumanQm) {
      scores[input.qmIndex] = (scores[input.qmIndex] ?? 0) + 2;
    }
    scores[input.fakeArtistIndex] = (scores[input.fakeArtistIndex] ?? 0) + 2;
    return {
      scores,
      scoreMessage: hasHumanQm
        ? "The Fake Artist was NOT caught! QM and Fake Artist earn 2 points each."
        : "The Fake Artist was NOT caught! Fake Artist earns 2 points.",
    };
  }

  if (input.correctGuess) {
    if (hasHumanQm) {
      scores[input.qmIndex] = (scores[input.qmIndex] ?? 0) + 2;
    }
    scores[input.fakeArtistIndex] = (scores[input.fakeArtistIndex] ?? 0) + 2;
    return {
      scores,
      scoreMessage: hasHumanQm
        ? "The Fake Artist guessed correctly! QM and Fake Artist earn 2 points each."
        : "The Fake Artist guessed correctly! Fake Artist earns 2 points.",
    };
  }

  for (let i = 0; i < input.playerCount; i++) {
    if (i !== input.qmIndex && i !== input.fakeArtistIndex) {
      scores[i] = (scores[i] ?? 0) + 1;
    }
  }
  return {
    scores,
    scoreMessage: "Wrong guess! All Artists earn 1 point each.",
  };
}
