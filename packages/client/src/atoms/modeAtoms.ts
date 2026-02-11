import { atom } from "jotai";

export type GameMode = "local" | "remote";

export const gameModeAtom = atom<GameMode>();
export const roomIdAtom = atom<string | null>(null);
export const isSpectatorAtom = atom(false);
