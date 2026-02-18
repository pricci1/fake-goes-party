import { atom } from "jotai";

export type GameMode = "local" | "remote";

export const gameModeAtom = atom<GameMode | undefined>(undefined);
export const roomIdAtom = atom<string | null>(null);
