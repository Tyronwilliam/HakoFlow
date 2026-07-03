import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { toConversationDetail } from "@/features/inbox/adapters";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = await params;
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
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(
      "id, primary_channel, external_id, display_handle, contact_id, contacts ( name, contact_channels ( provider, external_id, display_handle ) )",
    )
    .eq("id", conversationId)
    .eq("workspace_id", workspace.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversation: toConversationDetail(data) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = await params;
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 500 });
  }

  const { status, error: conversationError } = await supabase
    .from("conversations")
    .update({ unread_count: 0 })
    .eq("id", conversationId)
    .select();

  if (conversationError) {
    return NextResponse.json({ error: conversationError.message }, { status: 500 });
  }
  return NextResponse.json({ success: "conversation row updated" }, { status });
}
