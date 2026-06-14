import { faker } from "@faker-js/faker";
import type { SlackMessage } from "@/features/channels/slack/types";

export function createSlackMessages(count: number): SlackMessage[] {
  return Array.from({ length: count }, () => createSlackMessage());
}

export function createSlackMessage(overrides: Partial<SlackMessage> = {}): SlackMessage {
  return {
    type: "message",
    user: faker.string.alphanumeric(9).toUpperCase(),
    text: faker.lorem.sentence(),
    ts: (faker.date.recent().getTime() / 1000).toFixed(6),
    ...overrides,
  };
}
