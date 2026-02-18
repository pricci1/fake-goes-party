export { getStrokeLength, getArtistColor, getPlayerLegend, type PlayerLegendItem } from "@fake-goes-party/common";
import type { Point } from "@fake-goes-party/shared";

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
