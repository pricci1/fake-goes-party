/* eslint-disable react-refresh/only-export-components */
import { type ReactNode } from "react";
import { useAtomValue } from "jotai";
import {
  gameServicesAtom,
  gameSubscriptionsAtom,
  type GameServices,
} from "../atoms/gameServiceAtoms";

export function useGame(): GameServices {
  const services = useAtomValue(gameServicesAtom);
  if (!services) throw new Error("useGame must be used within GameProvider");
  return services;
}

export function GameProvider({ children }: { children: ReactNode }) {
  useAtomValue(gameSubscriptionsAtom);
  return children;
}
