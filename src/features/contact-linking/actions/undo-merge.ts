"use server";

import { createClient } from "@/lib/supabase/server";
import { undoMergeSchema } from "@/features/contact-linking/validators";

export interface UndoMergeState {
  error?: string;
  restoredContactId?: string;
}

export async function undoMerge(
  _prevState: UndoMergeState,
  formData: FormData,
): Promise<UndoMergeState> {
  const parsed = undoMergeSchema.safeParse({ mergeId: formData.get("mergeId") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return { error: "Non autorisé." };
  }

  const { data: restoredContactId, error } = await supabase.rpc("undo_merge_contacts", {
    p_merge_id: parsed.data.mergeId,
  });

  if (error) {
    return { error: "Impossible d'annuler cette fusion." };
  }

  return { restoredContactId };
}
