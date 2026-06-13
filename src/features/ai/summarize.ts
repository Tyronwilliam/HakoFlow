import { anthropic } from "@/lib/anthropic";

const MODEL = "claude-sonnet-4-5";

export async function summarizeThread(messages: string[]) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      { role: "user", content: `Summarize this conversation thread:\n\n${messages.join("\n")}` },
    ],
  });

  return response;
}
