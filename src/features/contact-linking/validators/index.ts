import { z } from "zod";

export const undoMergeSchema = z.object({
  mergeId: z.uuid("Identifiant de fusion invalide"),
});

export type UndoMergeInput = z.infer<typeof undoMergeSchema>;

export const undoLinkSchema = z.object({
  linkHistoryId: z.uuid("Identifiant de rattachement invalide"),
});

export type UndoLinkInput = z.infer<typeof undoLinkSchema>;
