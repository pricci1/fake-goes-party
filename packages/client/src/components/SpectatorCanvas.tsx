import { useAtomValue } from "jotai";
import {
  gameSnapshotAtom,
  strokesAtom,
  actingPlayerNameAtom,
} from "../atoms";
import { DrawingCanvasSurface } from "./DrawingCanvasSurface";
import { getPlayerLegend } from "./drawingUtils";

export function SpectatorCanvas() {
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
        canvasContainerClassName="w-[90vw] max-w-5xl h-[70vh] rounded bg-white border-2 border-gray-300"
        canvasClassName=""
      />
    </div>
  );
}
