const DISCORD_API_BASE = "https://discord.com/api/v10";

export async function listChannelMessages(channelId: string, botToken: string) {
  const response = await fetch(`${DISCORD_API_BASE}/channels/${channelId}/messages`, {
    headers: { Authorization: `Bot ${botToken}` },
  });

  return response.json();
}
