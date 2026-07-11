import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    return NextResponse.json({ history: [] });
  }

  const { data, error } = await supabase
    .from("contact_link_history")
    .select(
      `
      id,
      provider,
      linked_at,
      undone_at,
      moved_conversation_ids,
      target_contact:contacts_active!contact_link_history_target_contact_id_fkey ( id, name ),
      source_contact:contacts_active!contact_link_history_source_contact_id_fkey ( id, name )
    `,
    )
    .eq("workspace_id", workspace.id)
    .order("linked_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ history: data });
}
