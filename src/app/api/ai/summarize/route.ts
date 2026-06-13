import { NextResponse } from "next/server";
import { summarizeThread } from "@/features/ai/summarize";

export async function POST(request: Request) {
  const { messages } = await request.json();
  const result = await summarizeThread(messages);

  return NextResponse.json(result);
}
