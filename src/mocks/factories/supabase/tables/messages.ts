import { faker } from "@faker-js/faker";
import type { Channel, MessageRow } from "@/types";

export function createMessageRow(overrides: Partial<MessageRow> = {}): MessageRow {
  return {
    id: faker.string.uuid(),
    conversation_id: faker.string.uuid(),
    external_id: faker.string.alphanumeric(16),
    channel: faker.helpers.arrayElement<Channel>(["gmail", "discord", "slack"]),
    direction: faker.helpers.arrayElement(["inbound", "outbound"]),
    content: faker.lorem.paragraph(),
    status: "sent",
    attachment_urls: [],
    sent_at: faker.date.recent().toISOString(),
    read_at: null,
    expires_at: null,
    ...overrides,
  };
}

export function createMessageRows(
  count: number,
  overrides: Partial<MessageRow> = {},
): MessageRow[] {
  return Array.from({ length: count }, () => createMessageRow(overrides));
}
