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
import { gameSnapshotAtom } from "./gameAtoms";
import { strokesAtom } from "./drawAtoms";
import { gameModeAtom, roomIdAtom } from "./modeAtoms";

export interface GameServices {
  authority: GameAuthority;
  drawSync: DrawSync;
  dispatch: (event: GameEvent) => void;
}

export const gameServicesAtom = atom<GameServices | null>(null);

export const gameBootstrapAtom = atom(null, (get, set) => {
  if (get(gameServicesAtom)) return;

  const mode = get(gameModeAtom);
  const roomId = get(roomIdAtom);

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

  set(gameServicesAtom, {
    authority,
    drawSync,
    dispatch: (event) => authority.dispatch(event),
  });
});

gameBootstrapAtom.onMount = (setAtom) => {
  setAtom(gameBootstrapAtom);
};

export const gameSubscriptionsAtom = atom(null);

gameSubscriptionsAtom.onMount = () => {
  const store = getDefaultStore();
  let cleanup: (() => void) | null = null;

  const setupSubscriptions = (services: GameServices | null) => {
    if (!services || cleanup) return;

    store.set(gameSnapshotAtom, services.authority.getSnapshot());

    let lastRound = -1;
    const unsubGame = services.authority.subscribe((snapshot) => {
      store.set(gameSnapshotAtom, snapshot);

      if (snapshot.context.round !== lastRound) {
        lastRound = snapshot.context.round;
        services.drawSync.clear();
        store.set(strokesAtom, []);
      }
    });

    const unsubDraw = services.drawSync.onStroke(() => {
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
    setupSubscriptions(store.get(gameServicesAtom));
  });

  return () => {
    if (cleanup) cleanup();
    unsubServices();
  };
};
