import { atom } from "jotai";
import { gameSnapshotAtom } from "./snapshotAtom";

export { gameSnapshotAtom };

export const currentPhaseAtom = atom((get) => get(gameSnapshotAtom)?.state ?? null);

export const playersAtom = atom((get) => get(gameSnapshotAtom)?.context.players ?? []);

export const scoresAtom = atom((get) => get(gameSnapshotAtom)?.context.scores ?? []);

export const aiQmAtom = atom((get) => get(gameSnapshotAtom)?.context.aiQm ?? false);

export const aiGuessEvalAtom = atom((get) => get(gameSnapshotAtom)?.context.aiGuessEval ?? false);
