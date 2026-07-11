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
    return NextResponse.json({ merges: [] });
  }

  // source_contact lit `contacts` directement (pas `contacts_active`) :
  // seule exception volontaire au filtre centralisé HAK-75, car le contact
  // source d'une fusion est presque toujours soft-deleted et HAK-80 a besoin
  // d'afficher son nom malgré tout.
  const { data, error } = await supabase
    .from("contact_merges")
    .select(
      `
      id,
      merged_at,
      undone_at,
      moved_contact_channel_ids,
      moved_conversation_ids,
      target_contact:contacts_active!contact_merges_target_contact_id_fkey ( id, name ),
      source_contact:contacts!contact_merges_source_contact_id_fkey ( id, name )
    `,
    )
    .eq("workspace_id", workspace.id)
    .order("merged_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ merges: data });
}
