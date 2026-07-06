import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type MergeSuggestionAction = { action: "ignore" } | { action: "merge"; keepContactId: string };

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: suggestionId } = await params;
  const body = (await request.json()) as MergeSuggestionAction;

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (body.action === "ignore") {
    const { error } = await supabase
      .from("merge_suggestions")
      .update({ status: "ignored", decided_at: new Date().toISOString() })
      .eq("id", suggestionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  const { data: suggestion, error: suggestionError } = await supabase
    .from("merge_suggestions")
    .select("contact_a_id, contact_b_id")
    .eq("id", suggestionId)
    .single();

  if (suggestionError) {
    return NextResponse.json({ error: suggestionError.message }, { status: 500 });
  }

  const sourceContactId =
    body.keepContactId === suggestion.contact_a_id
      ? suggestion.contact_b_id
      : suggestion.contact_a_id;

  const { data: mergedContactId, error: mergeError } = await supabase.rpc("merge_contacts", {
    p_target_contact_id: body.keepContactId,
    p_source_contact_id: sourceContactId,
  });

  if (mergeError) {
    return NextResponse.json({ error: mergeError.message }, { status: 500 });
  }

  return NextResponse.json({ contactId: mergedContactId });
}
