
import { atomWithDefault } from "jotai/utils";
import { gameModeAtom } from "./modeAtoms";
import { gameSnapshotAtom } from "./snapshotAtom";
import { myPlayerIndicesAtom } from "./playerIdentityAtoms";

export const isSpectatorAtom = atomWithDefault((get) => {
  const mode = get(gameModeAtom);
  const phase = get(gameSnapshotAtom)?.state ?? null;
  const myIndices = get(myPlayerIndicesAtom);
  return mode === "remote" && myIndices.length === 0 && !!phase && phase !== "lobby";
});
