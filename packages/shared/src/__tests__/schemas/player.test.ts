import { describe, expect, test } from "bun:test";
import { PlayerSchema } from "../../schemas/index.ts";

describe("PlayerSchema", () => {
  test("accepts valid player", () => {
    const result = PlayerSchema.safeParse({ id: "abc-123", name: "Alice" });
    expect(result.success).toBe(true);
  });

  test("rejects missing name", () => {
    const result = PlayerSchema.safeParse({ id: "abc-123" });
    expect(result.success).toBe(false);
  });

  test("rejects empty name", () => {
    const result = PlayerSchema.safeParse({ id: "abc-123", name: "" });
    expect(result.success).toBe(false);
  });
});
