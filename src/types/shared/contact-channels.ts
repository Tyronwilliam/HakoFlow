import type { Channel } from "./channels";

export interface ContactChannelRow {
  contact_id: string;
  display_handle: string | null;
  external_id: string;
  id: string;
  provider: Channel;
}
