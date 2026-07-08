import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface LinkChannelsPayload {
  contactChannelIds: string[];
  targetContactId: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as LinkChannelsPayload;

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  for (const contactChannelId of body.contactChannelIds) {
    const { error } = await supabase.rpc("link_contact_channel", {
      p_contact_channel_id: contactChannelId,
      p_target_contact_id: body.targetContactId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ contactId: body.targetContactId });
}
