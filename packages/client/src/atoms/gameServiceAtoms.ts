import { atom } from "jotai";
import { atomEffect } from "jotai-effect";
import {
  LocalGameAuthority,
  LocalDrawSync,
  RemoteGameAuthority,
  RemoteDrawSync,
  type GameAuthority,
  type DrawSync,
  type GameEvent,
} from "@fake-goes-party/shared";
import { gameSnapshotAtom } from "./snapshotAtom";
import { strokesAtom } from "./drawAtoms";
import { gameModeAtom, roomIdAtom } from "./modeAtoms";
import { localRestoreAtom, localPersistenceEffectAtom } from "./localPersistenceAtoms";

export interface GameServices {
  authority: GameAuthority;
  drawSync: DrawSync;
  dispatch: (event: GameEvent) => void;
}

export const gameServicesAtom = atom<GameServices | null>((get) => {
  const mode = get(gameModeAtom);
  const roomId = get(roomIdAtom);
  if (!mode) return null;

  let authority: GameAuthority;
  let drawSync: DrawSync;

  if (mode === "local") {
    const restore = get(localRestoreAtom);
    authority = new LocalGameAuthority(restore?.snapshot);
    drawSync = new LocalDrawSync(restore?.strokes);
  } else if (mode === "remote") {
    if (!roomId) {
      throw new Error("Room ID required for remote mode");
    }
    const partyHost = import.meta.env.VITE_PARTYKIT_HOST || "localhost:1999";
    authority = new RemoteGameAuthority(roomId, partyHost);
    drawSync = new RemoteDrawSync(roomId, partyHost);
  } else {
    throw new Error(`Unknown game mode: ${mode}`);
  }

  return {
    authority,
    drawSync,
    dispatch: (event: GameEvent) => authority.dispatch(event),
  };
});

export const gameSubscriptionsAtom = atomEffect((get, set) => {
  const services = get(gameServicesAtom);
  if (!services) return;

  // Mount local persistence (no-op if not in local mode)
  get(localPersistenceEffectAtom);

  try {
    set(gameSnapshotAtom, services.authority.getSnapshot());
  } catch {
    // snapshot not ready yet (remote mode)
  }

  let lastRound = -1;
  const unsubGame = services.authority.subscribe((snapshot) => {
    set(gameSnapshotAtom, snapshot);

    if (snapshot.context.round !== lastRound) {
      lastRound = snapshot.context.round;
      services.drawSync.clear();
      set(strokesAtom, []);
    }
  });

  const unsubDraw = services.drawSync.onStroke(() => {
    set(strokesAtom, services.drawSync.getStrokes());
  });

  return () => {
    unsubGame();
    unsubDraw();
  };
});
