import { faker } from "@faker-js/faker";
import type { ChannelListType, ContactChannelRow } from "@/types";

export function createContactChannelRow(
  overrides: Partial<ContactChannelRow> = {},
): ContactChannelRow {
  const provider =
    overrides.provider ??
    faker.helpers.arrayElement<ChannelListType>(["gmail", "discord", "slack"]);

  return {
    id: faker.string.uuid(),
    contact_id: faker.string.uuid(),
    workspace_id: faker.string.uuid(),
    provider,
    external_id: faker.string.alphanumeric(16),
    display_handle: provider === "gmail" ? faker.internet.email() : faker.internet.username(),
    ...overrides,
  };
}

export function createContactChannelRows(
  count: number,
  overrides: Partial<ContactChannelRow> = {},
): ContactChannelRow[] {
  return Array.from({ length: count }, () => createContactChannelRow(overrides));
}
