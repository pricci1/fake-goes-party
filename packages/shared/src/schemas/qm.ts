import { z } from "zod";

export const QMContextSchema = z.object({
  playerCount: z.number().int().min(1),
  previousCategories: z.array(z.string()),
});

export type QMContext = z.infer<typeof QMContextSchema>;
