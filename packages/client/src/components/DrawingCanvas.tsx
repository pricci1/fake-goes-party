import { useAtomValue } from "jotai";
import {
  gameSnapshotAtom,
  strokesAtom,
  canActAtom,
  actingPlayerNameAtom,
  isMultiSeatAtom,
  actingPlayerIndexAtom,
} from "@fake-goes-party/common";
import { useDrawing } from "@fake-goes-party/common";
import { DevicePassGuard } from "./DevicePassGuard";
import { DrawingCanvasSurface } from "./DrawingCanvasSurface";
import type { PlayerLegendItem } from "./drawingUtils";
import { getArtistColor, getPlayerLegend } from "./drawingUtils";

interface DrawingCanvasInnerProps {
  playerIndex: number;
  color: string;
  drawRound: 1 | 2;
  playerName: string;
  canDraw: boolean;
  emphasizeTurn: boolean;
  playerLegend: PlayerLegendItem[];
  category: string;
}

function DrawingCanvasInner({
  playerIndex,
  color,
  drawRound,
  playerName,
  canDraw,
  emphasizeTurn,
  playerLegend,
  category,
}: DrawingCanvasInnerProps) {
  const strokes = useAtomValue(strokesAtom);

  const drawing = useDrawing({
    playerIndex,
    color,
    drawRound,
    enabled: canDraw,
  });

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
        <p className="text-md text-gray-500">Category: <b>{category}</b></p>
      </div>

      <DrawingCanvasSurface
        strokes={strokes}
        playerLegend={playerLegend}
        canvasContainerClassName={`w-[90vw] max-w-5xl h-[70vh] rounded bg-white ${
          !canDraw ? "opacity-80" : ""
        } ${
          emphasizeTurn
            ? "border-4 border-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.2)]"
            : "border-2 border-gray-300"
        }`}
        canvasClassName={`touch-none ${
          drawing.shortStrokePulse > 0
            ? "animate-[short-stroke-pulse_0.6s_ease-out]"
            : ""
        }`}
        canvasKey={drawing.shortStrokePulse}
        inProgressPoints={drawing.inProgressPoints}
        inProgressColor={color}
        onPointerDown={(x, y, pressure) => {
          if (!canDraw) return;
          drawing.handlePointerDown(x, y, pressure);
        }}
        onPointerMove={(x, y, pressure) => {
          if (!canDraw) return;
          drawing.handlePointerMove(x, y, pressure);
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
  const playerLegend = getPlayerLegend(ctx.players, ctx.qmIndex);

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
      category={ctx.category}
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
