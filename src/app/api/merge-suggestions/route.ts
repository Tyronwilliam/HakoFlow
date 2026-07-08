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
    return NextResponse.json({ suggestions: [] });
  }

  const { data, error } = await supabase
    .from("merge_suggestions")
    .select(
      `
      id,
      score,
      reason,
      contact_a:contacts!merge_suggestions_contact_a_id_fkey ( id, name ),
      contact_b:contacts!merge_suggestions_contact_b_id_fkey ( id, name )
    `,
    )
    .eq("workspace_id", workspace.id)
    .eq("status", "pending")
    .order("score", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suggestions: data });
}
