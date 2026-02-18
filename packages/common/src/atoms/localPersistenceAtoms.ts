import { atom } from "jotai";
import { atomEffect } from "jotai-effect";
import {
  atomWithStorage,
  createJSONStorage,
  unstable_withStorageValidator as withStorageValidator,
} from "jotai/utils";
import { z } from "zod";
import {
  GameSnapshotSchema,
  StrokeSchema,
  type GameSnapshot,
  type Stroke,
} from "@fake-goes-party/shared";
import { gameSnapshotAtom } from "./snapshotAtom";
import { strokesAtom } from "./drawAtoms";
import { gameModeAtom } from "./modeAtoms";

const STORAGE_KEY = "fgp:local-game";

const LocalGameSaveSchema = z.object({
  snapshot: GameSnapshotSchema,
  strokes: z.array(StrokeSchema),
  savedAt: z.number(),
});

export type LocalGameSave = z.infer<typeof LocalGameSaveSchema>;

const isLocalGameSave = (v: unknown): v is LocalGameSave | null =>
  v === null || LocalGameSaveSchema.safeParse(v).success;

export const localGameSaveStorageAtom = atomWithStorage<LocalGameSave | null>(
  STORAGE_KEY,
  null,
  withStorageValidator(isLocalGameSave)(createJSONStorage()),
  { getOnInit: true },
);

export const savedLocalGameAtom = atom((get) => get(localGameSaveStorageAtom));

export const clearLocalGameSaveAtom = atom(null, (_get, set) => {
  set(localGameSaveStorageAtom, null);
});

export interface LocalRestoreData {
  snapshot: GameSnapshot;
  strokes: Stroke[];
}

export const localRestoreAtom = atom<LocalRestoreData | null>(null);

const NON_SAVEABLE_STATES = new Set(["lobby", "gameOver"]);

export const localPersistenceEffectAtom = atomEffect((get, set) => {
  const mode = get(gameModeAtom);
  if (mode !== "local") return;

  const snapshot = get(gameSnapshotAtom);
  if (!snapshot) return;

  if (NON_SAVEABLE_STATES.has(snapshot.state)) {
    set(localGameSaveStorageAtom, null);
    return;
  }

  const strokes = get(strokesAtom);
  set(localGameSaveStorageAtom, {
    snapshot,
    strokes,
    savedAt: Date.now(),
  });
});
