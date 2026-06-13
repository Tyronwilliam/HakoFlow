import { faker } from "@faker-js/faker";
import type { GmailMessage } from "@/features/channels/gmail/types";

export function createGmailMessages(count: number): GmailMessage[] {
  return Array.from({ length: count }, () => createGmailMessage());
}

export function createGmailMessage(overrides: Partial<GmailMessage> = {}): GmailMessage {
  const id = faker.string.alphanumeric(16);

  return {
    id,
    threadId: id,
    snippet: faker.lorem.sentence(),
    payload: {
      headers: [
        { name: "From", value: `${faker.person.firstName()} <${faker.internet.email()}>` },
        { name: "To", value: faker.internet.email() },
        { name: "Subject", value: faker.lorem.sentence() },
        { name: "Date", value: faker.date.recent().toUTCString() },
      ],
      body: { data: Buffer.from(faker.lorem.paragraph()).toString("base64url") },
    },
    ...overrides,
  };
}
