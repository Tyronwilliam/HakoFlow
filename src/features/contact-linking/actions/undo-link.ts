"use server";

import { createClient } from "@/lib/supabase/server";
import { undoLinkSchema } from "@/features/contact-linking/validators";

export interface UndoLinkState {
  error?: string;
  restoredContactId?: string;
}

export async function undoLink(
  _prevState: UndoLinkState,
  formData: FormData,
): Promise<UndoLinkState> {
  const parsed = undoLinkSchema.safeParse({ linkHistoryId: formData.get("linkHistoryId") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return { error: "Non autorisé." };
  }

  const { data: restoredContactId, error } = await supabase.rpc("undo_link_contact_channel", {
    p_link_history_id: parsed.data.linkHistoryId,
  });

  if (error) {
    return { error: "Impossible d'annuler ce rattachement." };
  }

  return { restoredContactId };
}
