import { generateText, Output } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import type { GuessEvaluator, GuessEvalContext } from "@fake-goes-party/shared";

export class AiGuessEvaluator implements GuessEvaluator {
  async evaluateGuess(
    context: GuessEvalContext
  ): Promise<{ correct: boolean }> {
    const { output } = await generateText({
      model: openrouter("google/gemini-2.5-flash-lite"),
      output: Output.object({
        schema: z.object({
          correct: z
            .boolean()
            .describe(
              "Whether the guess is a close enough match for the title (accepting misspellings, synonyms, close variants)"
            ),
        }),
      }),
      prompt: `You are evaluating a player's guess in a drawing game. The player was shown a drawing and asked to guess the title.

The actual title is: "${context.title}"
The player's guess is: "${context.guess}"
The category is: "${context.category}"

Decide if the guess is close enough to accept as correct. You should accept:
- Exact matches
- Minor misspellings (e.g., "Cat" vs "Caat", "Panda" vs "Panda")
- Synonyms or closely related words within the category (e.g., "Big Cat" for "Lion", "Feline" for "Cat")
- Common variations (e.g., plural forms, singular forms)

Reject if the guess is:
- Completely different (e.g., "Dog" when the answer is "Cat")
- A different category entirely
- Vague or too generic

Return a JSON object with a single boolean field "correct".`,
    });

    return output;
  }
}
