import { faker } from "@faker-js/faker";
import type { ChannelListType } from "@/types";
import { ConversationRow } from "../../../../features/inbox/types";

export function createConversationRow(overrides: Partial<ConversationRow> = {}): ConversationRow {
  const primary_channel =
    overrides.primary_channel ??
    faker.helpers.arrayElement<ChannelListType>(["gmail", "discord", "slack"]);

  return {
    id: faker.string.uuid(),
    workspace_id: faker.string.uuid(),
    contact_id: faker.string.uuid(),
    primary_channel,
    external_id: faker.string.alphanumeric(16),
    display_handle:
      primary_channel === "gmail" ? faker.internet.email() : faker.internet.username(),
    last_message_at: faker.date.recent().toISOString(),
    last_message_preview: faker.lorem.sentence().slice(0, 60),
    unread_count: faker.number.int({ min: 0, max: 5 }),
    is_pinned: false,
    is_archived: false,
    is_starred: false,
    created_at: faker.date.past().toISOString(),
    ...overrides,
  };
}

export function createConversationRows(
  count: number,
  overrides: Partial<ConversationRow> = {},
): ConversationRow[] {
  return Array.from({ length: count }, () => createConversationRow(overrides));
}
