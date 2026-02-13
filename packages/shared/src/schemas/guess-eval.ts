import { z } from "zod";

export const GuessEvalContextSchema = z.object({
  title: z.string(),
  guess: z.string(),
  category: z.string(),
});

export type GuessEvalContext = z.infer<typeof GuessEvalContextSchema>;
