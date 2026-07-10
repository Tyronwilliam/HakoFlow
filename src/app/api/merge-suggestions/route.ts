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

  // contacts_active + !inner: filet de sécurité HAK-78 — exclut toute
  // suggestion dont contact_a ou contact_b est soft-deleted, y compris les
  // lignes créées avant ce correctif (le nettoyage à la source vit dans
  // HAK-77 / merge_contacts, mais ne couvre pas les données historiques).
  const { data, error } = await supabase
    .from("merge_suggestions")
    .select(
      `
      id,
      score,
      reason,
      contact_a:contacts_active!merge_suggestions_contact_a_id_fkey!inner ( id, name ),
      contact_b:contacts_active!merge_suggestions_contact_b_id_fkey!inner ( id, name )
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
