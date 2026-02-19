import { atom } from "jotai";

const _partyHostAtom = atom<string>("localhost:1999");

/**
 * Set this atom to configure the PartyKit host for the current platform.
 * Explicit [string] write args avoid TypeScript inference ambiguity with
 * store.set() vs jotai's default PrimitiveAtom<SetStateAction<string>> args.
 */
export const partyHostAtom = atom(
  (get) => get(_partyHostAtom),
  (_get, set, value: string) => set(_partyHostAtom, value),
);
