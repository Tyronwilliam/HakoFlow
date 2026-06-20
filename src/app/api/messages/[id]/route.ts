import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { toMessage } from "../../../../features/message/adapters";

const DEFAULT_STOP_INDEX = 20;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { searchParams } = new URL(request.url);
  const { id: conversationId } = await params;
  const startIndex = Number(searchParams.get("startIndex") ?? 0);
  const stopIndex = Number(searchParams.get("stopIndex") ?? DEFAULT_STOP_INDEX);

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error: messagesError } = await supabase.rpc("get_decrypted_messages", {
    p_conversation_id: conversationId,
    p_start: startIndex,
    p_stop: stopIndex,
  });

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  const messages = data.map(toMessage);

  return NextResponse.json({ messages });
}
