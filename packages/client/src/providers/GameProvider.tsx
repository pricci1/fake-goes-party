import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useSetAtom } from "jotai";
import { LocalGameAuthority, LocalDrawSync } from "@fake-goes-party/shared";
import type { GameAuthority, DrawSync, GameEvent } from "@fake-goes-party/shared";
import { gameSnapshotAtom, strokesAtom } from "../atoms";

interface GameServices {
  authority: GameAuthority;
  drawSync: DrawSync;
  dispatch: (event: GameEvent) => void;
}

const GameContext = createContext<GameServices | null>(null);

export function useGame(): GameServices {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const setSnapshot = useSetAtom(gameSnapshotAtom);
  const setStrokes = useSetAtom(strokesAtom);

  const servicesRef = useRef<GameServices | null>(null);
  if (!servicesRef.current) {
    const authority = new LocalGameAuthority();
    const drawSync = new LocalDrawSync();
    servicesRef.current = {
      authority,
      drawSync,
      dispatch: (event: GameEvent) => authority.dispatch(event),
    };
  }

  const services = servicesRef.current;

  useEffect(() => {
    // Seed initial snapshot
    setSnapshot(services.authority.getSnapshot());

    let lastRound = -1;

    const unsubGame = services.authority.subscribe((snapshot) => {
      setSnapshot(snapshot);

      if (snapshot.context.round !== lastRound) {
        lastRound = snapshot.context.round;
        services.drawSync.clear();
        setStrokes([]);
      }
    });

    const unsubDraw = services.drawSync.onStroke(() => {
      setStrokes(services.drawSync.getStrokes());
    });

    return () => {
      unsubGame();
      unsubDraw();
    };
  }, [services, setSnapshot, setStrokes]);

  return (
    <GameContext.Provider value={services}>
      {children}
    </GameContext.Provider>
  );
}
