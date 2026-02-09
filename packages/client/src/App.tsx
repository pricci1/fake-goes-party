import { useAtomValue } from "jotai";
import { gameModeAtom } from "./atoms/modeAtoms";
import { ModeSelection } from "./components/ModeSelection";
import { PhaseRouter } from "./components/PhaseRouter";
import { GameProvider } from "./providers/GameProvider";
import PWABadge from "./PWABadge";

export default function App() {
  const mode = useAtomValue(gameModeAtom);

  if (!mode) {
    return <ModeSelection />;
  }

  return (
    <GameProvider>
      <PhaseRouter />
      <PWABadge />
    </GameProvider>
  );
}
