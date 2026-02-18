import { atom } from "jotai";

/** Set this atom to configure the PartyKit host for the current platform */
export const partyHostAtom = atom<string>("localhost:1999");
