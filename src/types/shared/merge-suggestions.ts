export type MergeSuggestionStatus = "pending" | "merged" | "ignored";

export interface MergeSuggestionRow {
  contact_a_id: string;
  contact_b_id: string;
  created_at: string | null;
  decided_at: string | null;
  id: string;
  reason: string;
  score: number;
  status: MergeSuggestionStatus;
  workspace_id: string;
}
