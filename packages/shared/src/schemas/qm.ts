import { z } from "zod";
import { AI_QM_LANGUAGES } from "../constants/index.ts";

export const QMContextSchema = z.object({
  playerCount: z.number().int().min(1),
  previousCategories: z.array(z.string()),
  language: z.enum(AI_QM_LANGUAGES),
});

export type QMContext = z.infer<typeof QMContextSchema>;
