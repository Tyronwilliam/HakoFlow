export interface DiscordAuthor {
  id: string;
  username: string;
  global_name: string;
}

export interface DiscordMessage {
  id: string;
  channel_id: string;
  author: DiscordAuthor;
  content: string;
  timestamp: string; // ISO 8601
  attachments: unknown[];
  type: number;
}
