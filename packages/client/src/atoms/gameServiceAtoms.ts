import { atom } from "jotai";
import { getDefaultStore } from "jotai/vanilla";
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
    authority = new LocalGameAuthority();
    drawSync = new LocalDrawSync();
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

export const gameSubscriptionsAtom = atom(null);

gameSubscriptionsAtom.onMount = () => {
  const store = getDefaultStore();
  let cleanup: (() => void) | null = null;

  console.log("[gameSubscriptionsAtom] mount");

  const setupSubscriptions = (services: GameServices | null) => {
    if (!services || cleanup) return;

    console.log("[gameSubscriptionsAtom] setup subscriptions");

    // Try to get initial snapshot, but don't fail if not ready (for remote mode)
    try {
      store.set(gameSnapshotAtom, services.authority.getSnapshot());
    } catch {
      console.log("[gameSubscriptionsAtom] snapshot not ready yet (remote mode expected)");
    }

    let lastRound = -1;
    const unsubGame = services.authority.subscribe((snapshot) => {
      console.log("[gameSubscriptionsAtom] snapshot update", {
        phase: snapshot.state,
        round: snapshot.context.round,
      });
      store.set(gameSnapshotAtom, snapshot);

      if (snapshot.context.round !== lastRound) {
        lastRound = snapshot.context.round;
        services.drawSync.clear();
        store.set(strokesAtom, []);
      }
    });

    const unsubDraw = services.drawSync.onStroke(() => {
      console.log("[gameSubscriptionsAtom] stroke update");
      store.set(strokesAtom, services.drawSync.getStrokes());
    });

    cleanup = () => {
      unsubGame();
      unsubDraw();
      cleanup = null;
    };
  };

  setupSubscriptions(store.get(gameServicesAtom));
  const unsubServices = store.sub(gameServicesAtom, () => {
    console.log("[gameSubscriptionsAtom] services changed");
    setupSubscriptions(store.get(gameServicesAtom));
  });

  return () => {
    console.log("[gameSubscriptionsAtom] unmount");
    if (cleanup) cleanup();
    unsubServices();
  };
};
