export interface ContactMergeRow {
  id: string;
  merge_suggestion_id: string | null;
  merged_at: string;
  moved_contact_channel_ids: string[];
  moved_conversation_ids: string[];
  source_contact_id: string;
  target_contact_id: string;
  target_notes_before: string | null;
  target_tags_before: string[];
  undone_at: string | null;
  workspace_id: string;
}
