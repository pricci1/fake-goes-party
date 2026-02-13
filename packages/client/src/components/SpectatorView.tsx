import { useAtomValue, useSetAtom } from "jotai";
import {
  gameSnapshotAtom,
  strokesAtom,
  actingPlayerNameAtom,
} from "../atoms";
import { isSpectatorAtom } from "../atoms/modeAtoms";
import { DrawingCanvasSurface } from "./DrawingCanvasSurface";
import { getPlayerLegend } from "./drawingUtils";

function SpectatorCanvas() {
  const strokes = useAtomValue(strokesAtom);
  const snapshot = useAtomValue(gameSnapshotAtom);
  const actingPlayerName = useAtomValue(actingPlayerNameAtom);

  const ctx = snapshot?.context;
  const drawRound = (ctx?.drawRound ?? 1) as 1 | 2;
  const playerLegend = ctx ? getPlayerLegend(ctx.players, ctx.qmIndex) : [];

  return (
    <div className="flex flex-col items-center gap-2">
      {actingPlayerName && (
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{actingPlayerName}</span> is drawing
          {" · "}Round {drawRound} of 2
        </p>
      )}
      <DrawingCanvasSurface
        strokes={strokes}
        playerLegend={playerLegend}
        canvasContainerClassName="w-[90vw] max-w-5xl h-[70vh]"
        canvasClassName="rounded bg-white border-2 border-gray-300 w-full h-full"
      />
    </div>
  );
}

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
