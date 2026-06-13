export interface SlackMessage {
  type: string;
  user: string;
  text: string;
  ts: string; // Unix timestamp — aussi l'ID du message
  channel?: string;
}
