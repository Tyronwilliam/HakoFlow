import type { ContactIdentity } from "@/features/channels/shared/types";
import type { SlackMessage } from "@/features/channels/slack/types";

/**
 * Slack message payloads only carry the sender's user ID, not a display name —
 * resolving one requires a separate `users.info` call. Leave displayHandle
 * null here rather than guessing at it from unrelated fields.
 */
export function extractSlackContactIdentity(raw: SlackMessage): ContactIdentity {
  return {
    externalId: raw.user.trim(),
    displayHandle: null,
  };
}
