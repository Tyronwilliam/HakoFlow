import { faker } from "@faker-js/faker";
import type { Channel, ContactChannelRow } from "@/types";

export function createContactChannelRow(
  overrides: Partial<ContactChannelRow> = {},
): ContactChannelRow {
  return {
    id: faker.string.uuid(),
    contact_id: faker.string.uuid(),
    provider: faker.helpers.arrayElement<Channel>(["gmail", "discord", "slack"]),
    external_id: faker.string.alphanumeric(16),
    display_handle: faker.internet.username(),
    ...overrides,
  };
}

export function createContactChannelRows(
  count: number,
  overrides: Partial<ContactChannelRow> = {},
): ContactChannelRow[] {
  return Array.from({ length: count }, () => createContactChannelRow(overrides));
}
