import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toUnlinkedConversationOption } from "@/features/inbox/adapters";

export async function GET() {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("is_default", true)
    .single();

  if (workspaceError) {
    return NextResponse.json({ error: workspaceError.message }, { status: 500 });
  }
  if (!workspace) {
    return NextResponse.json({ conversations: [] });
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(
      "id, primary_channel, external_id, display_handle, last_message_preview, last_message_at",
    )
    .eq("workspace_id", workspace.id)
    .is("contact_id", null)
    .not("external_id", "is", null)
    .order("last_message_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const conversations = data.map(toUnlinkedConversationOption);

  return NextResponse.json({ conversations });
}
