import { useRef, useEffect, useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  gameSnapshotAtom,
  strokesAtom,
  actingPlayerNameAtom,
} from "../atoms";
import { isSpectatorAtom } from "../atoms/modeAtoms";
import { drawStrokeOnCanvas, getArtistColor } from "./drawingUtils";

function SpectatorCanvas() {
  const strokes = useAtomValue(strokesAtom);
  const snapshot = useAtomValue(gameSnapshotAtom);
  const actingPlayerName = useAtomValue(actingPlayerNameAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ctx = snapshot?.context;
  const drawRound = (ctx?.drawRound ?? 1) as 1 | 2;
  const playerLegend = ctx?.players
    .map((player, index) => ({ player, index }))
    .filter(({ index }) => index !== ctx?.qmIndex)
    .map(({ player, index }) => ({
      name: player.name,
      color: getArtistColor(index, ctx?.qmIndex ?? 0, ctx?.players.length ?? 0),
    })) ?? [];

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokes) {
      drawStrokeOnCanvas(canvasCtx, stroke.points, stroke.color);
    }
  }, [strokes]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return (
    <div className="flex flex-col items-center gap-2">
      {actingPlayerName && (
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{actingPlayerName}</span> is drawing
          {" · "}Round {drawRound} of 2
        </p>
      )}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="rounded bg-white border-2 border-gray-300"
      />
      <div className="w-full max-w-md">
        <p className="text-xs uppercase tracking-wide text-gray-400">Player colors</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {playerLegend.map((player) => (
            <div key={player.name} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full border border-white shadow"
                style={{ backgroundColor: player.color }}
              />
              <span className="text-sm text-gray-600">{player.name}</span>
            </div>
          ))}
        </div>
      </div>
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
