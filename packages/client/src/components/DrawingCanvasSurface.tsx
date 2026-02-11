import { useRef, useEffect, useCallback } from "react";
import type { Point, Stroke } from "@fake-goes-party/shared";
import { drawStrokeOnCanvas } from "./drawingUtils";
import type { PlayerLegendItem } from "./drawingUtils";

interface DrawingCanvasSurfaceProps {
  strokes: Stroke[];
  playerLegend: PlayerLegendItem[];
  canvasClassName: string;
  inProgressPoints?: Point[];
  inProgressColor?: string;
  onPointerDown?: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerLeave?: (event: React.PointerEvent<HTMLCanvasElement>) => void;
}

export function DrawingCanvasSurface({
  strokes,
  playerLegend,
  canvasClassName,
  inProgressPoints,
  inProgressColor,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
}: DrawingCanvasSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      drawStrokeOnCanvas(canvasCtx, stroke.points, stroke.color);
    }

    if (inProgressPoints && inProgressPoints.length > 0 && inProgressColor) {
      drawStrokeOnCanvas(canvasCtx, inProgressPoints, inProgressColor);
    }
  }, [strokes, inProgressPoints, inProgressColor]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className={canvasClassName}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
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
