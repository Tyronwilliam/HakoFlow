const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1";

export async function listMessages(accessToken: string) {
  const response = await fetch(`${GMAIL_API_BASE}/users/me/messages`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return response.json();
}
