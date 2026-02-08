import { useEffect, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import type { Point, Stroke } from "@fake-goes-party/shared";
import { useGame } from "../providers/GameProvider";
import { drawingStateFamily } from "../atoms";

interface UseDrawingOptions {
  playerIndex: number;
  color: string;
  drawRound: 1 | 2;
  enabled: boolean;
}

export function useDrawing({ playerIndex, color, drawRound, enabled }: UseDrawingOptions) {
  const { drawSync, dispatch } = useGame();
  const drawingKey = useMemo(() => `${playerIndex}-${drawRound}`, [playerIndex, drawRound]);
  const drawingAtom = useMemo(() => drawingStateFamily(drawingKey), [drawingKey]);
  const drawingState = useAtomValue(drawingAtom);
  const setDrawingState = useSetAtom(drawingAtom);

  useEffect(() => {
    setDrawingState({ type: "RESET" });
  }, [setDrawingState, playerIndex, drawRound]);

  const handlePointerDown = (x: number, y: number, pressure?: number) => {
    const point: Point = { x, y, pressure };
    setDrawingState({ type: "POINTER_DOWN", point, enabled });
  };

  const handlePointerMove = (x: number, y: number, pressure?: number) => {
    const point: Point = { x, y, pressure };
    setDrawingState({ type: "POINTER_MOVE", point });
  };

  const handlePointerUp = () => {
    if (!drawingState.isDrawing) return;
    const currentPoints = drawingState.inProgressPoints;
    if (currentPoints.length === 0) {
      setDrawingState({ type: "END_STROKE", strokeDone: drawingState.strokeDone });
      return;
    }

    const stroke: Stroke = {
      id: crypto.randomUUID(),
      playerIndex,
      color,
      points: currentPoints,
      drawRound,
      timestamp: Date.now(),
    };

    drawSync.pushStroke(stroke);
    dispatch({ type: "MARK_MADE" });
    setDrawingState({ type: "END_STROKE", strokeDone: true });
  };

  const resetStroke = () => {
    setDrawingState({ type: "RESET" });
  };

  return {
    inProgressPoints: drawingState.inProgressPoints,
    strokeDone: drawingState.strokeDone,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetStroke,
  };
}
