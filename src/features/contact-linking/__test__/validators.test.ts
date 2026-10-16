import { describe, expect, it } from "vitest";
import { undoLinkSchema, undoMergeSchema } from "../validators";

const uuid = "123e4567-e89b-42d3-a456-426614174000";

describe("undoMergeSchema / undoLinkSchema", () => {
  it("acceptent un UUID", () => {
    expect(undoMergeSchema.safeParse({ mergeId: uuid }).success).toBe(true);
    expect(undoLinkSchema.safeParse({ linkHistoryId: uuid }).success).toBe(true);
  });

  it("rejettent un id non UUID avec le message attendu", () => {
    expect(undoMergeSchema.safeParse({ mergeId: "1" }).error?.issues[0].message).toBe(
      "Identifiant de fusion invalide",
    );
    expect(undoLinkSchema.safeParse({ linkHistoryId: "1" }).error?.issues[0].message).toBe(
      "Identifiant de rattachement invalide",
    );
  });
});
