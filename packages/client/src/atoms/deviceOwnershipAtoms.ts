import { atom } from "jotai";
import { gameSnapshotAtom } from "./snapshotAtom";
import { myPlayerIndicesAtom } from "./playerIdentityAtoms";

export const activePlayerIndexAtom = atom<number | null>((get) => {
  const snapshot = get(gameSnapshotAtom);
  if (!snapshot) return null;

  const { state: phase, context } = snapshot;

  switch (phase) {
    case "setupQM":
    case "categorySelection":
      return context.qmIndex ?? null;
    case "drawingPhase": {
      const drawOrder = context.drawOrder;
      const currentDrawerIdx = context.currentDrawerIdx;
      if (!drawOrder || currentDrawerIdx === null || currentDrawerIdx === undefined) return null;
      return drawOrder[currentDrawerIdx] ?? null;
    }
    case "fakeArtistGuess":
      return context.fakeArtistIndex ?? null;
    default:
      return null;
  }
});

export const actingPlayerIndexAtom = atom<number | null>((get) => {
  const snapshot = get(gameSnapshotAtom);
  if (!snapshot) return null;

  switch (snapshot.state) {
    case "voting":
      return null;
    default:
      return get(activePlayerIndexAtom);
  }
});

export const canActAtom = atom((get) => {
  const actingIndex = get(actingPlayerIndexAtom);
  if (actingIndex === null) return false;
  return get(myPlayerIndicesAtom).includes(actingIndex);
});

export const actingPlayerNameAtom = atom<string | null>((get) => {
  const snapshot = get(gameSnapshotAtom);
  const actingIndex = get(actingPlayerIndexAtom);
  if (!snapshot || actingIndex === null) return null;
  return snapshot.context.players[actingIndex]?.name ?? null;
});

export const isMultiSeatAtom = atom((get) => get(myPlayerIndicesAtom).length > 1);

export const ownershipDebugAtom = atom((get) => ({
  phase: get(gameSnapshotAtom)?.state ?? null,
  activeIndex: get(activePlayerIndexAtom),
  actingIndex: get(actingPlayerIndexAtom),
  canAct: get(canActAtom),
}));
