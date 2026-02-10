import { useAtomValue } from "jotai";
import { currentPhaseAtom, myPlayerIndexAtom, playersAtom } from "../atoms";
import { gameModeAtom } from "../atoms/modeAtoms";
import { Lobby } from "./Lobby";
import { CategorySelection } from "./CategorySelection";
import { CardReveal } from "./CardReveal";
import { ColorSelection } from "./ColorSelection";
import { DrawingCanvas } from "./DrawingCanvas";
import { VotingScreen } from "./VotingScreen";
import { FakeArtistGuess } from "./FakeArtistGuess";
import { Scoring } from "./Scoring";
import { GameOver } from "./GameOver";
import { RoundResult } from "./RoundResult";
import { DevicePassGuard } from "./DevicePassGuard";

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-xl text-gray-500">Loading...</p>
    </div>
  );
}

export function PhaseRouter() {
  const phase = useAtomValue(currentPhaseAtom);
  const mode = useAtomValue(gameModeAtom);
  const players = useAtomValue(playersAtom);
  const myIndex = useAtomValue(myPlayerIndexAtom);

  console.log("PhaseRouter", { phase, mode, players, myIndex });

  const needsDevicePass = mode === "local" && myIndex !== null;
  const currentPlayerName = myIndex !== null ? players[myIndex]?.name : "";

  const renderPhase = () => {
    switch (phase) {
      case "lobby":
        return <Lobby />;
      case "setupQM":
      case "categorySelection":
        return <CategorySelection />;
      case "cardDistribution":
        return <CardReveal />;
      case "colorSelection":
        return <ColorSelection />;
      case "drawingPhase":
        return <DrawingCanvas />;
      case "voting":
        return <VotingScreen />;
      case "scoreFakeWins":
      case "evaluateGuess":
      case "scoring":
        return <Scoring />;
      case "fakeArtistGuess":
        return <FakeArtistGuess />;
      case "checkDrawing":
      case "evaluateVotes":
      case "checkWinner":
        return <RoundResult />;
      case "gameOver":
        return <GameOver />;
      default:
        return <Loading />;
    }
  };

  const content = renderPhase();

  if (needsDevicePass && currentPlayerName) {
    return <DevicePassGuard playerName={currentPlayerName}>{content}</DevicePassGuard>;
  }

  return content;
}
