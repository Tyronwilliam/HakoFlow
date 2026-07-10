import { z } from "zod";

export const undoMergeSchema = z.object({
  mergeId: z.uuid("Identifiant de fusion invalide"),
});

export type UndoMergeInput = z.infer<typeof undoMergeSchema>;
