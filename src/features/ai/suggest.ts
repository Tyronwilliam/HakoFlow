import { anthropic } from "@/lib/anthropic";

const MODEL = "claude-sonnet-4-5";

export async function suggestReply(messageContent: string) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: `Suggest a reply to this message:\n\n${messageContent}` }],
  });

  return response;
}
