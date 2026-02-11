import { AVAILABLE_COLORS } from "@fake-goes-party/shared";
import type { Point, Player } from "@fake-goes-party/shared";

export type PlayerLegendItem = { name: string; color: string };

export function drawStrokeOnCanvas(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

export function getArtistColor(playerIndex: number, qmIndex: number, playerCount: number): string {
  const artistIndices = Array.from({ length: playerCount }, (_, i) => i).filter(i => i !== qmIndex);
  const artistPos = artistIndices.indexOf(playerIndex);
  return AVAILABLE_COLORS[artistPos % AVAILABLE_COLORS.length];
}

export function getPlayerLegend(players: Player[], qmIndex: number | null | undefined) {
  const normalizedQmIndex = qmIndex ?? -1;
  return players
    .map((player, index) => ({ player, index }))
    .filter(({ index }) => index !== normalizedQmIndex)
    .map(({ player, index }) => ({
      name: player.name,
      color: getArtistColor(index, normalizedQmIndex, players.length),
    }));
}
