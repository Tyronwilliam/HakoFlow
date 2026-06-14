import type { Channel } from "./channels";

export interface ConnectedAccountRow {
  access_token: string | null;
  account_label: string | null;
  connected_at: string;
  expires_at: string | null;
  external_id: string;
  id: string;
  provider: Channel;
  refresh_token: string | null;
  status: "connected" | "disconnected" | "error";
  workspace_id: string;
}
