import { useAtomValue } from "jotai";
import { currentPhaseAtom } from "../atoms";
import { Lobby } from "./Lobby";

// Placeholder components — we'll build real ones in subsequent tasks
function Placeholder({ phase }: { phase: string }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl">Phase: {phase}</p>
    </div>
  );
}

export function PhaseRouter() {
  const phase = useAtomValue(currentPhaseAtom);

  if (!phase) return <Placeholder phase="loading" />;

  switch (phase) {
    case "lobby":             return <Lobby />;
    case "setupQM":           return <Placeholder phase="setupQM" />;
    case "categorySelection": return <Placeholder phase="categorySelection" />;
    case "cardDistribution":  return <Placeholder phase="cardDistribution" />;
    case "colorSelection":    return <Placeholder phase="colorSelection" />;
    case "drawingPhase":      return <Placeholder phase="drawingPhase" />;
    case "checkDrawing":      return <Placeholder phase="checkDrawing" />;
    case "voting":            return <Placeholder phase="voting" />;
    case "evaluateVotes":     return <Placeholder phase="evaluateVotes" />;
    case "scoreFakeWins":     return <Placeholder phase="scoreFakeWins" />;
    case "fakeArtistGuess":   return <Placeholder phase="fakeArtistGuess" />;
    case "evaluateGuess":     return <Placeholder phase="evaluateGuess" />;
    case "scoring":           return <Placeholder phase="scoring" />;
    case "checkWinner":       return <Placeholder phase="checkWinner" />;
    case "gameOver":          return <Placeholder phase="gameOver" />;
    default:                  return <Placeholder phase={`unknown: ${phase}`} />;
  }
}
