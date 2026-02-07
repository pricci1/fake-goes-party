import { atom } from "jotai";
import { getDefaultStore } from "jotai/vanilla";
import { LocalGameAuthority, LocalDrawSync } from "@fake-goes-party/shared";
import type { GameAuthority, DrawSync, GameEvent } from "@fake-goes-party/shared";
import { gameSnapshotAtom } from "./gameAtoms";
import { strokesAtom } from "./drawAtoms";

export interface GameServices {
  authority: GameAuthority;
  drawSync: DrawSync;
  dispatch: (event: GameEvent) => void;
}

export const gameServicesAtom = atom<GameServices | null>(null);

export const gameBootstrapAtom = atom(null, (get, set) => {
  if (get(gameServicesAtom)) return;
  const authority = new LocalGameAuthority();
  const drawSync = new LocalDrawSync();
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
