export interface ContactRow {
  blacklisted: boolean;
  created_at: string;
  deleted_at: string | null;
  enriched: boolean;
  id: string;
  name: string;
  notes: string | null;
  tags: string[];
  updated_at: string;
  workspace_id: string;
}
