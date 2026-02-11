import { atom } from "jotai";
import { myPlayerIndexAtom } from "./playerIdentityAtoms";
import { gameSnapshotAtom } from "./snapshotAtom";

export { gameSnapshotAtom };

export const currentPhaseAtom = atom((get) => get(gameSnapshotAtom)?.state ?? null);

export const playersAtom = atom((get) => get(gameSnapshotAtom)?.context.players ?? []);

export const scoresAtom = atom((get) => get(gameSnapshotAtom)?.context.scores ?? []);

export const amIDrawingAtom = atom((get) => {
  const snap = get(gameSnapshotAtom);
  const me = get(myPlayerIndexAtom);
  if (!snap || me === null) return false;
  return snap.context.drawOrder?.[snap.context.currentDrawerIdx] === me;
});

export const amIFakeArtistAtom = atom((get) => {
  const snap = get(gameSnapshotAtom);
  const me = get(myPlayerIndexAtom);
  if (!snap || me === null) return false;
  return snap.context.fakeArtistIndex === me;
});

export const amIQMAtom = atom((get) => {
  const snap = get(gameSnapshotAtom);
  const me = get(myPlayerIndexAtom);
  if (!snap || me === null) return false;
  return snap.context.qmIndex === me;
});

export const myCardAtom = atom((get) => {
  const snap = get(gameSnapshotAtom);
  const me = get(myPlayerIndexAtom);
  if (!snap || me === null) return null;
  const isQM = snap.context.qmIndex === me;
  if (isQM) return { role: "qm" as const, category: snap.context.category, title: snap.context.title };
  const isFake = snap.context.fakeArtistIndex === me;
  if (isFake) return { role: "fake" as const, category: snap.context.category };
  return { role: "artist" as const, category: snap.context.category, title: snap.context.title };
});
