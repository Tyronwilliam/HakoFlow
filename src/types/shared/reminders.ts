export interface ReminderRow {
  conversation_id: string | null;
  created_at: string;
  done: boolean;
  id: string;
  note: string | null;
  remind_at: string;
  workspace_id: string;
}
