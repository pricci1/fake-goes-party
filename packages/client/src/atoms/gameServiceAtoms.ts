import { atom } from "jotai";
import { atomEffect } from "jotai-effect";
import { LocalDrawSync, RemoteDrawSync, type GameAuthority, type DrawSync, type GameEvent } from "@fake-goes-party/shared";
import { LocalGameAuthority } from "../authorities/LocalGameAuthority.ts";
import { RemoteGameAuthority } from "../authorities/RemoteGameAuthority.ts";
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

  let initialSnapshot: ReturnType<typeof services.authority.getSnapshot> | undefined;
  try {
    initialSnapshot = services.authority.getSnapshot();
    set(gameSnapshotAtom, initialSnapshot);
  } catch {
    // snapshot not ready yet (remote mode)
  }

  // Seed strokesAtom with any restored strokes
  const initialStrokes = services.drawSync.getStrokes();
  if (initialStrokes.length > 0) {
    set(strokesAtom, initialStrokes);
  }

  // Start from the current round so the first snapshot doesn't wipe restored strokes
  let lastRound = initialSnapshot?.context.round ?? -1;
  let lastState: string | undefined = initialSnapshot?.state;
  const unsubGame = services.authority.subscribe((snapshot) => {
    set(gameSnapshotAtom, snapshot);

    const roundChanged = snapshot.context.round !== lastRound;
    const returnedToLobby = snapshot.state === "lobby" && lastState !== "lobby";
    if (roundChanged || returnedToLobby) {
      services.drawSync.clear();
      set(strokesAtom, []);
    }
    lastRound = snapshot.context.round;
    lastState = snapshot.state;
  });

  const unsubDraw = services.drawSync.onStroke(() => {
    set(strokesAtom, services.drawSync.getStrokes());
  });

  return () => {
    unsubGame();
    unsubDraw();
  };
});
