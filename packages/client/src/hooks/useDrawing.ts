import { useCallback, useRef, useState } from "react";
import type { Point, Stroke } from "@fake-goes-party/shared";
import { useGame } from "../providers/GameProvider";

interface UseDrawingOptions {
  playerIndex: number;
  color: string;
  drawRound: 1 | 2;
  enabled: boolean;
}

export function useDrawing({ playerIndex, color, drawRound, enabled }: UseDrawingOptions) {
  const { drawSync, dispatch } = useGame();
  const [inProgressPoints, setInProgressPoints] = useState<Point[]>([]);
  const isDrawingRef = useRef(false);
  const [strokeDone, setStrokeDone] = useState(false);

  const handlePointerDown = useCallback(
    (x: number, y: number, pressure?: number) => {
      if (!enabled || strokeDone) return;
      isDrawingRef.current = true;
      setInProgressPoints([{ x, y, pressure }]);
    },
    [enabled, strokeDone]
  );

  const handlePointerMove = useCallback(
    (x: number, y: number, pressure?: number) => {
      if (!isDrawingRef.current) return;
      setInProgressPoints((prev) => [...prev, { x, y, pressure }]);
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    setInProgressPoints((currentPoints) => {
      if (currentPoints.length === 0) return currentPoints;

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
      setStrokeDone(true);
      return [];
    });

    return undefined;
  }, [playerIndex, color, drawRound, drawSync, dispatch]);

  const resetStroke = useCallback(() => {
    setStrokeDone(false);
    setInProgressPoints([]);
  }, []);

  return {
    inProgressPoints,
    strokeDone,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetStroke,
  };
}
