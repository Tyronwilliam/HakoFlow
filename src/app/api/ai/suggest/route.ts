import { NextResponse } from "next/server";
import { suggestReply } from "@/features/ai/suggest";

export async function POST(request: Request) {
  const { message } = await request.json();
  const result = await suggestReply(message);

  return NextResponse.json(result);
}
