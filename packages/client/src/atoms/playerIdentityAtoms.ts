import { atom } from "jotai";
import {
  atomWithStorage,
  createJSONStorage,
  unstable_withStorageValidator as withStorageValidator,
} from "jotai/utils";
import { z } from "zod";
import { gameSnapshotAtom } from "./snapshotAtom";
import { gameModeAtom, roomIdAtom } from "./modeAtoms";

const DevicePlayersSchema = z.record(z.string(), z.array(z.string()));

type DevicePlayers = z.infer<typeof DevicePlayersSchema>;

const isDevicePlayers = (v: unknown): v is DevicePlayers =>
  DevicePlayersSchema.safeParse(v).success;

const devicePlayersStorageAtom = atomWithStorage<DevicePlayers>(
  "fgp:device-players",
  {},
  withStorageValidator(isDevicePlayers)(createJSONStorage()),
  { getOnInit: true },
);

const storageKeyAtom = atom((get) => {
  const mode = get(gameModeAtom);
  if (mode === "local") return "local";
  return get(roomIdAtom) ?? null;
});

export const devicePlayerIdsAtom = atom(
  (get) => {
    const key = get(storageKeyAtom);
    if (!key) return [];
    return get(devicePlayersStorageAtom)[key] ?? [];
  },
  (get, set, playerIds: string[]) => {
    const key = get(storageKeyAtom);
    if (!key) return;
    const current = get(devicePlayersStorageAtom);
    set(devicePlayersStorageAtom, { ...current, [key]: playerIds });
  },
);

export const registerPlayerIdAtom = atom(null, (get, set, playerId: string) => {
  const ids = get(devicePlayerIdsAtom);
  if (!ids.includes(playerId)) {
    set(devicePlayerIdsAtom, [...ids, playerId]);
  }
});

export const myPlayerIndicesAtom = atom((get) => {
  const mode = get(gameModeAtom);
  const snap = get(gameSnapshotAtom);
  if (!snap) return [];

  if (mode === "local") {
    return snap.context.players.map((_, i) => i);
  }

  const deviceIds = get(devicePlayerIdsAtom);
  const indices: number[] = [];
  for (let i = 0; i < snap.context.players.length; i++) {
    const player = snap.context.players[i];
    if (player && deviceIds.includes(player.id)) {
      indices.push(i);
    }
  }
  return indices;
});

export const allPlayersOnDeviceAtom = atom((get) => {
  const mode = get(gameModeAtom);
  const snap = get(gameSnapshotAtom);
  if (!snap) return false;
  if (mode === "local") return true;

  const deviceIds = get(devicePlayerIdsAtom);
  return snap.context.players.every((player) =>
    player ? deviceIds.includes(player.id) : false
  );
});

export const myPlayerIndexAtom = atom<number | null>((get) => {
  const indices = get(myPlayerIndicesAtom);
  if (indices.length === 0) return null;
  if (indices.length === 1) return indices[0] ?? null;

  const snap = get(gameSnapshotAtom);
  if (!snap) return indices[0] ?? null;

  const currentDrawer = snap.context.drawOrder?.[snap.context.currentDrawerIdx];
  if (currentDrawer !== undefined && indices.includes(currentDrawer)) {
    return currentDrawer;
  }

  return indices[0] ?? null;
});

export const previousRemoteRoomIdsAtom = atom((get) => {
  const storage = get(devicePlayersStorageAtom);
  return Object.keys(storage).filter((key) => key !== "local");
});
