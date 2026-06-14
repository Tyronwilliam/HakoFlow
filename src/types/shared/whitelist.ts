import type { Channel } from "./channels";

export interface WhitelistRow {
  created_at: string;
  display_handle: string | null;
  external_id: string;
  id: string;
  provider: Channel;
  workspace_id: string;
}
