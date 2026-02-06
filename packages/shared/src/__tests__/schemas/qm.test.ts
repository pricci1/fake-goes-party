import { describe, expect, test } from "bun:test";
import { QMContextSchema } from "../../schemas/index.ts";

describe("QMContextSchema", () => {
  test("accepts valid QM context", () => {
    const result = QMContextSchema.safeParse({
      playerCount: 5,
      previousCategories: ["Animals", "Food"],
    });
    expect(result.success).toBe(true);
  });

  test("accepts empty previous categories", () => {
    const result = QMContextSchema.safeParse({
      playerCount: 3,
      previousCategories: [],
    });
    expect(result.success).toBe(true);
  });
});
