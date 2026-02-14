import { useEffect, useMemo, useState } from "react";
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

const MIN_STROKE_LENGTH = 0.05;

const getStrokeLength = (points: Point[]) => {
  if (points.length < 2) return 0;
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.hypot(dx, dy);
  }
  return length;
};

export function useDrawing({ playerIndex, color, drawRound, enabled }: UseDrawingOptions) {
  const { drawSync, dispatch } = useGame();
  const drawingKey = useMemo(() => `${playerIndex}-${drawRound}`, [playerIndex, drawRound]);
  const drawingAtom = useMemo(() => drawingStateFamily(drawingKey), [drawingKey]);
  const drawingState = useAtomValue(drawingAtom);
  const setDrawingState = useSetAtom(drawingAtom);
  const [shortStrokePulse, setShortStrokePulse] = useState(0);

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

    if (getStrokeLength(currentPoints) < MIN_STROKE_LENGTH) {
      setShortStrokePulse(Date.now());
      setDrawingState({ type: "END_STROKE", strokeDone: false });
      return;
    }

    const stroke: Stroke = {
      id: crypto.randomUUID(),
      playerIndex,
      color,
      points: currentPoints,
      drawRound,
      timestamp: Date.now(),
      normalized: true,
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
    shortStrokePulse,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetStroke,
  };
}
