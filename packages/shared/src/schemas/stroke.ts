import { z } from "zod";

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
  pressure: z.number().optional(),
});

export type Point = z.infer<typeof PointSchema>;

export const StrokeSchema = z.object({
  id: z.string().uuid(),
  playerIndex: z.number().int().min(0),
  color: z.string(),
  points: z.array(PointSchema).min(1),
  drawRound: z.literal(1).or(z.literal(2)),
  timestamp: z.number(),
  normalized: z.boolean().optional(),
});

export type Stroke = z.infer<typeof StrokeSchema>;
