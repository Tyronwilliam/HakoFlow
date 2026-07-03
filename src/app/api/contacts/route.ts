import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toContact } from "@/features/contacts/adapters";

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
    return NextResponse.json({ contacts: [] });
  }

  const { data, error } = await supabase
    .from("contacts")
    .select("id, name")
    .eq("workspace_id", workspace.id)
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const contacts = data.map(toContact);

  return NextResponse.json({ contacts });
}
