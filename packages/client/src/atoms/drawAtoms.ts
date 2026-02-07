import { atom } from "jotai";
import { atomFamily, atomWithReducer } from "jotai/utils";
import type { Point, Stroke } from "@fake-goes-party/shared";

export const strokesAtom = atom<Stroke[]>([]);

interface DrawingState {
  inProgressPoints: Point[];
  isDrawing: boolean;
  strokeDone: boolean;
}

type DrawingAction =
  | { type: "POINTER_DOWN"; point: Point; enabled: boolean }
  | { type: "POINTER_MOVE"; point: Point }
  | { type: "END_STROKE"; strokeDone: boolean }
  | { type: "RESET" };

const initialDrawingState: DrawingState = {
  inProgressPoints: [],
  isDrawing: false,
  strokeDone: false,
};

const drawingReducer = (state: DrawingState, action: DrawingAction): DrawingState => {
  switch (action.type) {
    case "POINTER_DOWN":
      if (!action.enabled || state.strokeDone) return state;
      return {
        ...state,
        isDrawing: true,
        inProgressPoints: [action.point],
      };
    case "POINTER_MOVE":
      if (!state.isDrawing) return state;
      return {
        ...state,
        inProgressPoints: [...state.inProgressPoints, action.point],
      };
    case "END_STROKE":
      return {
        ...state,
        isDrawing: false,
        inProgressPoints: [],
        strokeDone: action.strokeDone,
      };
    case "RESET":
      return {
        ...initialDrawingState,
      };
    default:
      return state;
  }
};

export const drawingStateFamily = atomFamily(() =>
  atomWithReducer(initialDrawingState, drawingReducer)
);
