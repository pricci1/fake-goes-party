import { AVAILABLE_COLORS } from "@fake-goes-party/shared";
import type { Point, Player } from "@fake-goes-party/shared";

export type PlayerLegendItem = { name: string; color: string };

export function getStrokeLength(points: Point[]) {
  if (points.length < 2) return 0;
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.hypot(dx, dy);
  }
  return length;
}

export function drawStrokeOnCanvas(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  lineWidth = 3,
) {
  if (points.length < 2) return;
  const canvasWidth = ctx.canvas.width || 1;
  const canvasHeight = ctx.canvas.height || 1;
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));
  const isNormalized = maxX <= 1.01 && maxY <= 1.01;
  const scaleX = isNormalized ? canvasWidth : 1;
  const scaleY = isNormalized ? canvasHeight : 1;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x * scaleX, points[i].y * scaleY);
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
