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
  const pointsRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);
  const [strokeDone, setStrokeDone] = useState(false);

  const handlePointerDown = useCallback(
    (x: number, y: number, pressure?: number) => {
      if (!enabled || strokeDone) return;
      isDrawingRef.current = true;
      const nextPoints = [{ x, y, pressure }];
      pointsRef.current = nextPoints;
      setInProgressPoints(nextPoints);
    },
    [enabled, strokeDone]
  );

  const handlePointerMove = useCallback(
    (x: number, y: number, pressure?: number) => {
      if (!isDrawingRef.current) return;
      setInProgressPoints((prev) => {
        const nextPoints = [...prev, { x, y, pressure }];
        pointsRef.current = nextPoints;
        return nextPoints;
      });
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const currentPoints = pointsRef.current;
    if (currentPoints.length === 0) return;

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
    pointsRef.current = [];
    setInProgressPoints([]);
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
