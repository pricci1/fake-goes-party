import { useAtomValue } from "jotai";
import { gameModeAtom, GameProvider } from "@fake-goes-party/common";
import { ModeSelection } from "./components/ModeSelection";
import { PhaseRouter } from "./components/PhaseRouter";
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
