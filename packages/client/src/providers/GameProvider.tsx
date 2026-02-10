/* eslint-disable react-refresh/only-export-components */
import { useEffect, type ReactNode } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  gameBootstrapAtom,
  gameServicesAtom,
  gameSubscriptionsAtom,
  type GameServices,
} from "../atoms/gameServiceAtoms";
import { gameModeAtom } from "../atoms/modeAtoms";

export function useGame(): GameServices {
  const services = useAtomValue(gameServicesAtom);
  if (!services) throw new Error("useGame must be used within GameProvider");
  return services;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const bootstrap = useSetAtom(gameBootstrapAtom);
  const mode = useAtomValue(gameModeAtom);
  
  useEffect(() => {
    // Only bootstrap once mode is selected
    if (mode) {
      bootstrap();
    }
  }, [mode, bootstrap]);
  
  useAtomValue(gameSubscriptionsAtom);
  return children;
}
