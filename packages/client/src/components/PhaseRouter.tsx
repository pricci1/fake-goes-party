import { useAtomValue } from "jotai";
import { currentPhaseAtom } from "../atoms";
import { Lobby } from "./Lobby";
import { CategorySelection } from "./CategorySelection";
import { CardReveal } from "./CardReveal";
import { ColorSelection } from "./ColorSelection";
import { DrawingCanvas } from "./DrawingCanvas";
import { VotingScreen } from "./VotingScreen";
import { FakeArtistGuess } from "./FakeArtistGuess";
import { Scoring } from "./Scoring";
import { GameOver } from "./GameOver";

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
    case "setupQM":           return <CategorySelection />;
    case "categorySelection": return <CategorySelection />;
    case "cardDistribution":  return <CardReveal />;
    case "colorSelection":    return <ColorSelection />;
    case "drawingPhase":      return <DrawingCanvas />;
    case "checkDrawing":      return <DrawingCanvas />;
    case "voting":            return <VotingScreen />;
    case "evaluateVotes":     return <VotingScreen />;
    case "scoreFakeWins":     return <Scoring />;
    case "fakeArtistGuess":   return <FakeArtistGuess />;
    case "evaluateGuess":     return <Scoring />;
    case "scoring":           return <Scoring />;
    case "checkWinner":       return <Scoring />;
    case "gameOver":          return <GameOver />;
    default:                  return <Placeholder phase={`unknown: ${phase}`} />;
  }
}
