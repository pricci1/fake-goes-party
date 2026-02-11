import { useRef, useEffect, useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  gameSnapshotAtom,
  strokesAtom,
  actingPlayerNameAtom,
} from "../atoms";
import { isSpectatorAtom } from "../atoms/modeAtoms";
import type { Point } from "@fake-goes-party/shared";

function drawStrokeOnCanvas(ctx: CanvasRenderingContext2D, points: Point[], color: string) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

function SpectatorCanvas() {
  const strokes = useAtomValue(strokesAtom);
  const snapshot = useAtomValue(gameSnapshotAtom);
  const actingPlayerName = useAtomValue(actingPlayerNameAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ctx = snapshot?.context;
  const drawRound = (ctx?.drawRound ?? 1) as 1 | 2;

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
