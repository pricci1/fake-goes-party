import { AVAILABLE_COLORS } from "@fake-goes-party/shared";
import type { Point, Player } from "@fake-goes-party/shared";

export type PlayerLegendItem = { name: string; color: string };

export function getStrokeLength(points: Point[]): number {
  if (points.length < 2) return 0;
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i]!.x - points[i - 1]!.x;
    const dy = points[i]!.y - points[i - 1]!.y;
    length += Math.hypot(dx, dy);
  }
  return length;
}

export function getArtistColor(playerIndex: number, qmIndex: number, playerCount: number): string {
  const artistIndices = Array.from({ length: playerCount }, (_, i) => i).filter((i) => i !== qmIndex);
  const artistPos = artistIndices.indexOf(playerIndex);
  return AVAILABLE_COLORS[artistPos % AVAILABLE_COLORS.length] ?? "#888";
}

export function getPlayerLegend(players: Player[], qmIndex: number | null | undefined): PlayerLegendItem[] {
  const normalizedQmIndex = qmIndex ?? -1;
  return players
    .map((player, index) => ({ player, index }))
    .filter(({ index }) => index !== normalizedQmIndex)
    .map(({ player, index }) => ({
      name: player.name,
      color: getArtistColor(index, normalizedQmIndex, players.length),
    }));
}
