import { faker } from "@faker-js/faker";
import type { ChannelListType, ConnectedAccountRow } from "@/types";

export function createConnectedAccountRow(
  overrides: Partial<ConnectedAccountRow> = {},
): ConnectedAccountRow {
  return {
    id: faker.string.uuid(),
    workspace_id: faker.string.uuid(),
    provider: faker.helpers.arrayElement<ChannelListType>(["gmail", "discord", "slack"]),
    external_id: faker.string.alphanumeric(16),
    account_label: faker.internet.email(),
    access_token: faker.string.alphanumeric(32),
    refresh_token: faker.string.alphanumeric(32),
    expires_at: faker.date.future().toISOString(),
    status: "connected",
    connected_at: faker.date.past().toISOString(),
    ...overrides,
  };
}

export function createConnectedAccountRows(
  count: number,
  overrides: Partial<ConnectedAccountRow> = {},
): ConnectedAccountRow[] {
  return Array.from({ length: count }, () => createConnectedAccountRow(overrides));
}
