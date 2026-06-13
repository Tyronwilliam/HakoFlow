const SLACK_API_BASE = "https://slack.com/api";

export async function listChannelMessages(channelId: string, botToken: string) {
  const response = await fetch(`${SLACK_API_BASE}/conversations.history?channel=${channelId}`, {
    headers: { Authorization: `Bearer ${botToken}` },
  });

  return response.json();
}
