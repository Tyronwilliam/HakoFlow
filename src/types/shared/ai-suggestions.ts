export interface AiSuggestionRow {
  accepted: boolean;
  content: string;
  conversation_id: string;
  created_at: string;
  id: string;
  type: "reply" | "summary";
  workspace_id: string;
}
