import { useSetAtom } from "jotai";
import { isSpectatorAtom } from "../atoms/modeAtoms";
import { SpectatorCanvas } from "./SpectatorCanvas";

interface SpectatorViewProps {
  message: string;
  showCanvas?: boolean;
}

export function SpectatorView({ message, showCanvas }: SpectatorViewProps) {
  const setSpectator = useSetAtom(isSpectatorAtom);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
          👀 Spectator
        </span>
      </div>

      <p className="text-lg text-gray-600">{message}</p>

      {showCanvas && <SpectatorCanvas />}

      <button
        onClick={() => setSpectator(false)}
        className="text-sm text-gray-400 hover:text-gray-600 underline mt-4"
      >
        Leave spectator mode
      </button>
    </div>
  );
}
