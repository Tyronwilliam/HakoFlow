import { faker } from "@faker-js/faker";
import type { Channel, ConversationRow } from "@/types";

export function createConversationRow(overrides: Partial<ConversationRow> = {}): ConversationRow {
  return {
    id: faker.string.uuid(),
    workspace_id: faker.string.uuid(),
    contact_id: faker.string.uuid(),
    primary_channel: faker.helpers.arrayElement<Channel>(["gmail", "discord", "slack"]),
    external_id: faker.string.alphanumeric(16),
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
