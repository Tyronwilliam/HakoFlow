import { describe, expect, it } from "vitest";
import { reminderSchema } from "../validators";

describe("reminderSchema", () => {
  it("accepte un titre et une date ISO", () => {
    expect(
      reminderSchema.safeParse({ title: "Relancer", dueAt: "2025-01-01T10:00:00Z" }).success,
    ).toBe(true);
  });

  it("rejette un titre vide ou une date non ISO", () => {
    expect(reminderSchema.safeParse({ title: "", dueAt: "2025-01-01T10:00:00Z" }).success).toBe(
      false,
    );
    expect(reminderSchema.safeParse({ title: "x", dueAt: "demain" }).success).toBe(false);
  });
});
