import { faker } from "@faker-js/faker";
import type { ChannelListType, WhitelistRow } from "@/types";

export function createWhitelistRow(overrides: Partial<WhitelistRow> = {}): WhitelistRow {
  return {
    id: faker.string.uuid(),
    workspace_id: faker.string.uuid(),
    provider: faker.helpers.arrayElement<ChannelListType>(["gmail", "discord", "slack"]),
    external_id: faker.string.alphanumeric(16),
    display_handle: faker.internet.username(),
    created_at: faker.date.past().toISOString(),
    ...overrides,
  };
}

export function createWhitelistRows(
  count: number,
  overrides: Partial<WhitelistRow> = {},
): WhitelistRow[] {
  return Array.from({ length: count }, () => createWhitelistRow(overrides));
}
