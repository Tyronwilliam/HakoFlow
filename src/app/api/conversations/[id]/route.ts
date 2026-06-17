import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

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
