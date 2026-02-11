import { useRef, useEffect, useCallback } from "react";
import { useAtomValue } from "jotai";
import {
  gameSnapshotAtom,
  strokesAtom,
  canActAtom,
  actingPlayerNameAtom,
  isMultiSeatAtom,
  actingPlayerIndexAtom,
} from "../atoms";
import { useDrawing } from "../hooks/useDrawing";
import { AVAILABLE_COLORS } from "@fake-goes-party/shared";
import type { Point } from "@fake-goes-party/shared";
import { DevicePassGuard } from "./DevicePassGuard";

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

function getArtistColor(playerIndex: number, qmIndex: number, playerCount: number): string {
  const artistIndices = Array.from({ length: playerCount }, (_, i) => i).filter(i => i !== qmIndex);
  const artistPos = artistIndices.indexOf(playerIndex);
  return AVAILABLE_COLORS[artistPos % AVAILABLE_COLORS.length];
}

interface DrawingCanvasInnerProps {
  playerIndex: number;
  color: string;
  drawRound: 1 | 2;
  playerName: string;
  canDraw: boolean;
}

function DrawingCanvasInner({
  playerIndex,
  color,
  drawRound,
  playerName,
  canDraw,
}: DrawingCanvasInnerProps) {
  const strokes = useAtomValue(strokesAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawing = useDrawing({
    playerIndex,
    color,
    drawRound,
    enabled: canDraw,
  });

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      drawStrokeOnCanvas(canvasCtx, stroke.points, stroke.color);
    }

    if (drawing.inProgressPoints.length > 0) {
      drawStrokeOnCanvas(canvasCtx, drawing.inProgressPoints, color);
    }
  }, [strokes, drawing.inProgressPoints, color]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 gap-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">{playerName}'s turn</h2>
        <p className="text-sm text-gray-500">Round {drawRound} of 2 — Draw one continuous line</p>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className={`border-2 border-gray-300 rounded bg-white touch-none ${
          canDraw ? "" : "opacity-80"
        }`}
        onPointerDown={(e) => {
          if (!canDraw) return;
          const pt = getCanvasPoint(e);
          drawing.handlePointerDown(pt.x, pt.y, e.pressure);
        }}
        onPointerMove={(e) => {
          if (!canDraw) return;
          const pt = getCanvasPoint(e);
          drawing.handlePointerMove(pt.x, pt.y, e.pressure);
        }}
        onPointerUp={() => {
          if (!canDraw) return;
          drawing.handlePointerUp();
        }}
        onPointerLeave={() => {
          if (!canDraw) return;
          drawing.handlePointerUp();
        }}
      />

      {!canDraw && (
        <p className="text-sm text-gray-400">Waiting for {playerName} to finish drawing.</p>
      )}

      {drawing.strokeDone && (
        <p className="text-green-600 font-medium">Stroke submitted! Pass the device to the next player.</p>
      )}
    </div>
  );
}

export function DrawingCanvas() {
  const snapshot = useAtomValue(gameSnapshotAtom);
  const canAct = useAtomValue(canActAtom);
  const actingPlayerName = useAtomValue(actingPlayerNameAtom);
  const isMultiSeat = useAtomValue(isMultiSeatAtom);
  const actingPlayerIndex = useAtomValue(actingPlayerIndexAtom);

  const ctx = snapshot?.context;
  if (!snapshot || !ctx) return null;

  const currentDrawerPlayerIndex = actingPlayerIndex ?? 0;
  const currentColor = getArtistColor(currentDrawerPlayerIndex, ctx.qmIndex, ctx.players.length);
  const drawRound = (ctx.drawRound ?? 1) as 1 | 2;
  const currentDrawer = ctx.players[currentDrawerPlayerIndex];

  const canvas = (
    <DrawingCanvasInner
      key={`${ctx.currentDrawerIdx}-${drawRound}`}
      playerIndex={currentDrawerPlayerIndex}
      color={currentColor}
      drawRound={drawRound}
      playerName={actingPlayerName ?? currentDrawer?.name ?? "Player"}
      canDraw={canAct}
    />
  );

  if (!canAct) {
    return canvas;
  }

  return (
    <DevicePassGuard
      playerName={actingPlayerName ?? currentDrawer?.name ?? "Player"}
      canAct={canAct}
      isMultiSeat={isMultiSeat}
      key={`${ctx.currentDrawerIdx}-${drawRound}`}
    >
      {canvas}
    </DevicePassGuard>
  );
}
