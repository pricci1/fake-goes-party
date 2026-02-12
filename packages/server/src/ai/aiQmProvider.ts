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
      model: openrouter("google/gemini-2.5-flash-lite"),
      output: Output.object({schema: z.object({
        category: z.string().describe("A broad drawing category"),
        title: z
          .string()
          .describe("A specific thing within that category to draw"),
      })}),
      prompt: `Pick a category and a drawable title for a ${context.playerCount}-player drawing game called "A Fake Artist Goes to New York".

The category should be broad (e.g. "Animals", "Food", "Vehicles", "Musical Instruments").
The title should be a specific, well-known thing within that category that most people can draw with simple strokes (e.g. category "Animals", title "Cat").

Keep both the category and title short (1-3 words each). The title must be something universally recognizable.${avoidClause}`,
    });

    return output;
  }
}
