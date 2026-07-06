import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toContactConversationGroup } from "@/features/inbox/adapters";
import type { RawContactGroupRow, RawGroupedConversation } from "@/features/inbox/adapters";

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
    return NextResponse.json({ groups: [] });
  }

  const { data, error } = await supabase.rpc("list_contact_conversation_groups", {
    p_workspace_id: workspace.id,
    p_start_index: startIndex,
    p_stop_index: stopIndex,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rawGroups = data.map((row) => ({
    ...row,
    conversations: (row.conversations ?? []) as unknown as RawGroupedConversation[],
  })) satisfies RawContactGroupRow[];

  const groups = rawGroups.map(toContactConversationGroup);

  return NextResponse.json({ groups });
}
