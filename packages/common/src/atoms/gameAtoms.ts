import { atom } from "jotai";
import { gameSnapshotAtom } from "./snapshotAtom";
import { partyHostAtom } from "./configAtom";
import { roomIdAtom } from "./modeAtoms";

export { gameSnapshotAtom };

export const currentPhaseAtom = atom((get) => get(gameSnapshotAtom)?.state ?? null);

export const playersAtom = atom((get) => get(gameSnapshotAtom)?.context.players ?? []);

export const scoresAtom = atom((get) => get(gameSnapshotAtom)?.context.scores ?? []);

export const aiQmAtom = atom((get) => get(gameSnapshotAtom)?.context.aiQm ?? false);

export const aiGuessEvalAtom = atom((get) => get(gameSnapshotAtom)?.context.aiGuessEval ?? false);

export const aiQmLanguageAtom = atom((get) => get(gameSnapshotAtom)?.context.aiQmLanguage ?? "English");

export const maxDrawRoundsAtom = atom((get) => get(gameSnapshotAtom)?.context.maxDrawRounds ?? 2);

export const winThresholdAtom = atom((get) => get(gameSnapshotAtom)?.context.winThreshold ?? 5);

export const suggestingAtom = atom(false);

export const aiSuggestAtom = atom(
  null,
  async (get, set, { playerCount, language }: { playerCount: number; language: string }) => {
    const roomId = get(roomIdAtom);
    if (!roomId) return null;
    set(suggestingAtom, true);
    try {
      const partyHost = get(partyHostAtom);
      const protocol = partyHost.startsWith("localhost") ? "http" : "https";
      const url = `${protocol}://${partyHost}/parties/game/${roomId}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerCount,
          previousCategories: [],
          language,
        }),
      });
      if (!res.ok) throw new Error("Failed to get suggestion");
      const data = await res.json();
      return data as { category: string; title: string };
    } catch (error) {
      console.error("AI suggestion failed:", error);
      return null;
    } finally {
      set(suggestingAtom, false);
    }
  }
);
