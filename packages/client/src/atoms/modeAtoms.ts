import { atom } from "jotai";
import { currentPhaseAtom, myPlayerIndicesAtom } from "./index";

export type GameMode = "local" | "remote";

export const gameModeAtom = atom<GameMode>();
export const roomIdAtom = atom<string | null>(null);

/** Manual override: null = use auto-detection, true/false = explicit choice */
const spectatorOverrideAtom = atom<boolean | null>(null);

export const isSpectatorAtom = atom(
  (get) => {
    const override = get(spectatorOverrideAtom);
    if (override !== null) return override;
    const mode = get(gameModeAtom);
    const phase = get(currentPhaseAtom);
    const myIndices = get(myPlayerIndicesAtom);
    return mode === "remote" && myIndices.length === 0 && !!phase && phase !== "lobby";
  },
  (_get, set, value: boolean) => {
    set(spectatorOverrideAtom, value);
  },
);
