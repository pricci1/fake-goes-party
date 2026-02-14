import { generateText, Output } from "ai";
import { openrouter } from '@openrouter/ai-sdk-provider';
import { z } from "zod";
import type { QMProvider, QMContext } from "@fake-goes-party/shared";

export class AiQmProvider implements QMProvider {
  async pickCategoryAndTitle(
    context: QMContext
  ): Promise<{ category: string; title: string }> {
    const avoidClause =
      context.previousCategories.length > 0
        ? `\nAvoid these previously used categories: ${context.previousCategories.join(", ")}.`
        : "";

    const { output } = await generateText({
      model: openrouter("mistralai/ministral-3b-2512"),
      temperature: 1.3,
      output: Output.object({
        schema: z.object({
          options: z.array(
            z.object({
              category: z.string().describe("A broad drawing category"),
              title: z
                .string()
                .describe("A specific thing within that category to draw"),
            })
          ).length(6),
        })
      }),
      prompt: `Pick 6 different categories, each with a drawable title, for a ${context.playerCount}-player drawing game called "A Fake Artist Goes to New York".

You are the Question Master. You score points when the Fake Artist blends in undetected, so pick simple, obvious titles that are easy to draw and easy to guess from the category alone. Avoid obscure, tricky, or overly specific topics.

Each category should be broad (e.g. "Animals", "Food", "Vehicles", "Musical Instruments").
Each title should be the most iconic, universally known thing in that category — something anyone can draw in a few strokes (e.g. category "Animals", title "Cat"; category "Fruit", title "Apple").

Keep both the category and title short (1-3 words each). Do not use the examples given above as your answers.${avoidClause}
Generate the categories and titles in ${context.language}.`,
    });

    const chosen = output.options[Math.floor(Math.random() * output.options.length)];
    return chosen;
  }
}
