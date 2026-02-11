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
import { DevicePassGuard } from "./DevicePassGuard";
import { drawStrokeOnCanvas, getArtistColor } from "./drawingUtils";

interface DrawingCanvasInnerProps {
  playerIndex: number;
  color: string;
  drawRound: 1 | 2;
  playerName: string;
  canDraw: boolean;
  emphasizeTurn: boolean;
  playerLegend: Array<{ name: string; color: string }>;
}

function DrawingCanvasInner({
  playerIndex,
  color,
  drawRound,
  playerName,
  canDraw,
  emphasizeTurn,
  playerLegend,
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
        <h2 className="text-xl font-bold">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-base font-semibold text-blue-700">
            {playerName}
          </span>
          {" "}is up
        </h2>
        <p className="text-sm text-gray-500">Round {drawRound} of 2 — Draw one continuous line</p>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className={`rounded bg-white touch-none ${
          canDraw ? "" : "opacity-80"
        } ${
          emphasizeTurn
            ? "border-4 border-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.2)]"
            : "border-2 border-gray-300"
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
  const playerLegend = ctx.players
    .map((player, index) => ({ player, index }))
    .filter(({ index }) => index !== ctx.qmIndex)
    .map(({ player, index }) => ({
      name: player.name,
      color: getArtistColor(index, ctx.qmIndex, ctx.players.length),
    }));

  const canvas = (
    <DrawingCanvasInner
      key={`${ctx.currentDrawerIdx}-${drawRound}`}
      playerIndex={currentDrawerPlayerIndex}
      color={currentColor}
      drawRound={drawRound}
      playerName={actingPlayerName ?? currentDrawer?.name ?? "Player"}
      canDraw={canAct}
      emphasizeTurn={canAct && !isMultiSeat}
      playerLegend={playerLegend}
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
