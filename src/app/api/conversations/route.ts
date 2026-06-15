import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toConversationListItem } from "@/features/inbox/adapters";

const DEFAULT_STOP_INDEX = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startIndex = Number(searchParams.get("startIndex") ?? 0);
  const stopIndex = Number(searchParams.get("stopIndex") ?? DEFAULT_STOP_INDEX);

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("is_default", true)
    .single();

  if (!workspace) {
    return NextResponse.json({ conversations: [] });
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      primary_channel,
      last_message_at,
      last_message_preview,
      unread_count,
      is_pinned,
      is_starred,
      contacts ( name, contact_channels ( provider, display_handle ) )
    `,
    )
    .eq("workspace_id", workspace.id)
    .eq("is_archived", false)
    .range(startIndex, stopIndex)
    .order("last_message_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const conversations = data.map(toConversationListItem);

  return NextResponse.json({ conversations });
}
