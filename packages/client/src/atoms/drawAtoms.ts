import { atom } from "jotai";
import type { Stroke } from "@fake-goes-party/shared";

export const strokesAtom = atom<Stroke[]>([]);
