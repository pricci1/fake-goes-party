import { atom } from "jotai";
import { currentPhaseAtom, myPlayerIndicesAtom } from "./index";
import { atomWithDefault } from "jotai/utils";

export type GameMode = "local" | "remote";

export const gameModeAtom = atom<GameMode>();
export const roomIdAtom = atom<string | null>(null);

// auto-detection until set
export const isSpectatorAtom = atomWithDefault((get) => {
  const mode = get(gameModeAtom);
  const phase = get(currentPhaseAtom);
  const myIndices = get(myPlayerIndicesAtom);
  return mode === "remote" && myIndices.length === 0 && !!phase && phase !== "lobby";
});
