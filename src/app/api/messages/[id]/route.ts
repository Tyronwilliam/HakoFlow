import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { toMessage } from "../../../../features/message/adapters";

const DEFAULT_STOP_INDEX = 20;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { searchParams } = new URL(request.url);
  const { id } = await params;
  const startIndex = Number(searchParams.get("startIndex") ?? 0);
  const stopIndex = Number(searchParams.get("stopIndex") ?? DEFAULT_STOP_INDEX);

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error: messagesError } = await supabase
    .from("messages")
    .select(
      `
    id, 
    channel, 
    direction, 
    content, 
    status,
    sent_at, 
    read_at, 
    expires_at, 
    conversation_id,
    external_id, 
    attachment_urls,
    conversations!inner 
    ( workspace_id,
      workspaces!inner ( user_id )
    )
  `,
    )
    .eq("conversation_id", id)
    .eq("conversations.workspaces.user_id", auth.user.id)
    .range(startIndex, stopIndex)
    .order("sent_at", { ascending: true });

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  const messages = data.map(toMessage);

  return NextResponse.json({ messages });
}
