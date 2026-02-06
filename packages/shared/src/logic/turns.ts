import type { Player } from "../schemas/index.ts";
import { WIN_THRESHOLD } from "../constants/index.ts";

export function getQmIndex(round: number, playerCount: number): number {
  return round % playerCount;
}

export function getArtistIndices(
  playerCount: number,
  qmIndex: number
): number[] {
  const artists: number[] = [];
  for (let i = 0; i < playerCount; i++) {
    if (i !== qmIndex) artists.push(i);
  }
  return artists;
}

/**
 * Returns array of winning players. Empty if no one has met the threshold.
 * If multiple players meet threshold, only those tied for the highest score win.
 */
export function findWinners(
  scores: number[],
  players: Player[],
  threshold: number = WIN_THRESHOLD
): Player[] {
  const maxScore = Math.max(...scores);
  if (maxScore < threshold) return [];
  return players.filter((_, i) => scores[i] === maxScore);
}
