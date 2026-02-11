import { atom } from "jotai";
import type { GameSnapshot } from "@fake-goes-party/shared";

export const gameSnapshotAtom = atom<GameSnapshot | null>(null);
