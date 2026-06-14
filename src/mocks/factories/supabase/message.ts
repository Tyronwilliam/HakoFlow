import { faker } from "@faker-js/faker";
import { CHANNELS_LIST } from "@/components/shared/channel-badge";
import type { Message } from "@/types";

export function createMessages(count: number): Message[] {
  return Array.from({ length: count }, () => createMessage());
}
export function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: faker.string.uuid(),
    channel: faker.helpers.arrayElement(Object.keys(CHANNELS_LIST) as Message["channel"][]),
    externalId: faker.string.alphanumeric(16),
    from: faker.person.fullName(),
    fromHandle: faker.internet.username(),
    content: faker.lorem.paragraph(),
    preview: faker.lorem.sentence().slice(0, 60),
    direction: faker.helpers.arrayElement(["inbound", "outbound"]),
    sentAt: faker.date.recent(),
    read: faker.datatype.boolean(),
    attachmentUrls: [],
    ...overrides,
  };
}
