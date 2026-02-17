import { useRef, useEffect, useCallback } from "react";
import type { Point, Stroke } from "@fake-goes-party/shared";
import type { PlayerLegendItem } from "./drawingUtils";

interface DrawingCanvasSurfaceProps {
  strokes: Stroke[];
  playerLegend: PlayerLegendItem[];
  canvasClassName: string;
  canvasContainerClassName?: string;
  canvasKey?: number;
  inProgressPoints?: Point[];
  inProgressColor?: string;
  lineWidth?: number;
  onPointerDown?: (x: number, y: number, pressure: number) => void;
  onPointerMove?: (x: number, y: number, pressure: number) => void;
  onPointerUp?: () => void;
  onPointerLeave?: () => void;
}

export function DrawingCanvasSurface({
  strokes,
  playerLegend,
  canvasClassName,
  canvasContainerClassName,
  canvasKey,
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
    // Canvas spans the full window width so pointer events are captured far beyond the
    // visible rectangle, preventing accidental stroke submission near the borders.
    canvas.width = window.innerWidth;
    canvas.height = Math.floor(rect.height);
  }, []);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const containerRect = container.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    // Pixel offset of the visible rectangle's left edge within the full-width canvas.
    const offsetX = containerRect.left - canvasRect.left;
    const scaleX = containerRect.width;
    const scaleY = containerRect.height;

    // Draw normalized [0,1] points into the container-sized region of the full-width canvas.
    // Points outside [0,1] render beyond the rectangle but are clipped by overflow-hidden.
    const drawPoints = (points: Point[], color: string) => {
      if (points.length < 2) return;
      canvasCtx.beginPath();
      canvasCtx.strokeStyle = color;
      canvasCtx.lineWidth = lineWidth;
      canvasCtx.lineCap = "round";
      canvasCtx.lineJoin = "round";
      canvasCtx.moveTo(offsetX + points[0].x * scaleX, points[0].y * scaleY);
      for (let i = 1; i < points.length; i++) {
        canvasCtx.lineTo(offsetX + points[i].x * scaleX, points[i].y * scaleY);
      }
      canvasCtx.stroke();
    };

    for (const stroke of strokes) {
      drawPoints(stroke.points, stroke.color);
    }

    if (inProgressPoints && inProgressPoints.length > 0 && inProgressColor) {
      drawPoints(inProgressPoints, inProgressColor);
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

  // Coordinates relative to the visible container, without clamping, so strokes
  // drawn outside the border continue naturally on the wider canvas.
  const getContainerPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* overflow-hidden clips the full-width canvas to the visible rectangle */}
      <div ref={containerRef} className={`relative overflow-hidden ${canvasContainerClassName ?? ""}`}>
        <canvas
          key={canvasKey}
          ref={canvasRef}
          className={canvasClassName}
          style={{ position: "absolute", left: "calc(-50vw + 50%)", width: "100vw", height: "100%" }}
          onPointerDown={(e) => {
            // Capture pointer so leaving the rectangle doesn't fire pointerleave mid-stroke.
            e.currentTarget.setPointerCapture(e.pointerId);
            const pt = getContainerPoint(e);
            onPointerDown?.(pt.x, pt.y, e.pressure);
          }}
          onPointerMove={(e) => {
            const pt = getContainerPoint(e);
            onPointerMove?.(pt.x, pt.y, e.pressure);
          }}
          onPointerUp={() => onPointerUp?.()}
          onPointerLeave={() => onPointerLeave?.()}
        />
      </div>
      <div className="w-full max-w-md">
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
