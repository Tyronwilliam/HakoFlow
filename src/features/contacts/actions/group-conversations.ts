"use server";

import { createClient } from "@/lib/supabase/server";
import { groupConversationsSchema } from "@/features/contacts/validators";

export interface GroupConversationsState {
  error?: string;
  success?: boolean;
  contactId?: string;
}

export async function groupConversationsUnderContact(
  _prevState: GroupConversationsState,
  formData: FormData,
): Promise<GroupConversationsState> {
  const rawTargetContactId = formData.get("targetContactId")?.toString();

  const parsed = groupConversationsSchema.safeParse({
    targetContactId: rawTargetContactId,
    conversationIds: formData.getAll("conversationIds").map(String),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return { error: "Unauthorized" };
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("is_default", true)
    .single();

  if (workspaceError || !workspace) {
    return { error: "Workspace introuvable." };
  }

  const { data, error } = await supabase.rpc("group_conversations_under_contact", {
    p_workspace_id: workspace.id,
    p_target_contact_id: parsed.data.targetContactId,
    p_new_contact_name: "",
    p_conversation_ids: parsed.data.conversationIds,
  });

  if (error) {
    if (error.code === "P0001") {
      return { error: error.message };
    }
    return { error: "Une erreur est survenue, veuillez réessayer." };
  }

  return { success: true, contactId: data ?? undefined };
}
