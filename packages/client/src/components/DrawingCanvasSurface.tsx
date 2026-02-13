import { useRef, useEffect, useCallback } from "react";
import type { Point, Stroke } from "@fake-goes-party/shared";
import { drawStrokeOnCanvas } from "./drawingUtils";
import type { PlayerLegendItem } from "./drawingUtils";

interface DrawingCanvasSurfaceProps {
  strokes: Stroke[];
  playerLegend: PlayerLegendItem[];
  canvasClassName: string;
  canvasContainerClassName?: string;
  inProgressPoints?: Point[];
  inProgressColor?: string;
  lineWidth?: number;
  onPointerDown?: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove?: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerLeave?: (event: React.PointerEvent<HTMLCanvasElement>) => void;
}

export function DrawingCanvasSurface({
  strokes,
  playerLegend,
  canvasClassName,
  canvasContainerClassName,
  inProgressPoints,
  inProgressColor,
  lineWidth = 3,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
}: DrawingCanvasSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);
  }, []);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      drawStrokeOnCanvas(canvasCtx, stroke.points, stroke.color, lineWidth);
    }

    if (inProgressPoints && inProgressPoints.length > 0 && inProgressColor) {
      drawStrokeOnCanvas(canvasCtx, inProgressPoints, inProgressColor, lineWidth);
    }
  }, [strokes, inProgressPoints, inProgressColor, lineWidth]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(() => {
      resizeCanvas();
      renderCanvas();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [renderCanvas, resizeCanvas]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} className={canvasContainerClassName}>
        <canvas
          ref={canvasRef}
          className={canvasClassName}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
        />
      </div>
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
