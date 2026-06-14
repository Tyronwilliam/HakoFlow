import { faker } from "@faker-js/faker";
import type { DiscordMessage } from "@/features/channels/discord/types";

export function createDiscordMessages(count: number): DiscordMessage[] {
  return Array.from({ length: count }, () => createDiscordMessage());
}

export function createDiscordMessage(overrides: Partial<DiscordMessage> = {}): DiscordMessage {
  return {
    id: faker.string.numeric(18),
    channel_id: faker.string.numeric(18),
    author: {
      id: faker.string.numeric(18),
      username: faker.internet.username(),
      global_name: faker.person.firstName(),
    },
    content: faker.lorem.sentence(),
    timestamp: faker.date.recent().toISOString(),
    attachments: [],
    type: 0,
    ...overrides,
  };
}
