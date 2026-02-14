import { describe, expect, test } from "bun:test";
import { QMContextSchema } from "../../schemas/index.ts";

describe("QMContextSchema", () => {
  test("accepts valid QM context", () => {
    const result = QMContextSchema.safeParse({
      playerCount: 5,
      previousCategories: ["Animals", "Food"],
      language: "English",
    });
    expect(result.success).toBe(true);
  });

  test("accepts empty previous categories", () => {
    const result = QMContextSchema.safeParse({
      playerCount: 3,
      previousCategories: [],
      language: "Spanish",
    });
    expect(result.success).toBe(true);
  });

  test("accepts all valid languages", () => {
    for (const lang of ["English", "Spanish", "French", "Portuguese", "German", "Japanese"]) {
      const result = QMContextSchema.safeParse({
        playerCount: 4,
        previousCategories: [],
        language: lang,
      });
      expect(result.success).toBe(true);
    }
  });

  test("rejects invalid language", () => {
    const result = QMContextSchema.safeParse({
      playerCount: 4,
      previousCategories: [],
      language: "Pig Latin",
    });
    expect(result.success).toBe(false);
  });

  test("rejects missing language", () => {
    const result = QMContextSchema.safeParse({
      playerCount: 4,
      previousCategories: [],
    });
    expect(result.success).toBe(false);
  });
});
