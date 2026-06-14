import { faker } from "@faker-js/faker";
import type { Channel, ContactRow, ContactChannelRow, ConversationRow, MessageRow } from "@/types";
import { createContactRow } from "./tables/contacts";
import { createContactChannelRow } from "./tables/contact-channels";
import { createConversationRow } from "./tables/conversations";
import { createMessageRow } from "./tables/messages";

const CHANNELS: Channel[] = ["gmail", "discord", "slack"];

const TOPICS = [
  "Devis pour un site web",
  "Suivi de projet en cours",
  "Question sur la facturation",
  "Proposition de collaboration",
  "Support technique",
  "Disponibilité pour un appel",
];

export interface WorkspaceScenario {
  contacts: ContactRow[];
  contactChannels: ContactChannelRow[];
  conversations: ConversationRow[];
  messages: MessageRow[];
}

export function createWorkspaceScenario(workspaceId: string, contactCount = 5): WorkspaceScenario {
  const contacts: ContactRow[] = [];
  const contactChannels: ContactChannelRow[] = [];
  const conversations: ConversationRow[] = [];
  const messages: MessageRow[] = [];

  for (let i = 0; i < contactCount; i++) {
    const contact = createContactRow({ workspace_id: workspaceId });
    contacts.push(contact);

    const channels = faker.helpers.arrayElements(CHANNELS, { min: 1, max: CHANNELS.length });

    for (const channel of channels) {
      contactChannels.push(createContactChannelRow({ contact_id: contact.id, provider: channel }));

      const conversationCount = faker.number.int({ min: 1, max: 2 });

      for (let c = 0; c < conversationCount; c++) {
        const conversation = createConversationRow({
          workspace_id: workspaceId,
          contact_id: contact.id,
          primary_channel: channel,
        });

        const thread = createMessageThread(conversation.id, channel);
        messages.push(...thread);

        const lastMessage = thread[thread.length - 1];

        conversations.push({
          ...conversation,
          last_message_at: lastMessage.sent_at,
          last_message_preview: lastMessage.content.slice(0, 60),
          unread_count: thread.filter((m) => m.direction === "inbound" && !m.read_at).length,
        });
      }
    }
  }

  return { contacts, contactChannels, conversations, messages };
}

function createMessageThread(conversationId: string, channel: Channel): MessageRow[] {
  const topic = faker.helpers.arrayElement(TOPICS);
  const messageCount = faker.number.int({ min: 2, max: 8 });

  let sentAt = faker.date.recent({ days: 14 });

  return Array.from({ length: messageCount }, (_, index) => {
    sentAt = faker.date.soon({ days: 1, refDate: sentAt });

    const direction = index % 2 === 0 ? "inbound" : "outbound";
    const content = index === 0 ? `${topic}. ${faker.lorem.sentence()}` : faker.lorem.paragraph();

    const isLastMessage = index === messageCount - 1;
    const read = direction === "outbound" || (!isLastMessage && faker.datatype.boolean());

    return createMessageRow({
      conversation_id: conversationId,
      channel,
      direction,
      content,
      sent_at: sentAt.toISOString(),
      read_at: read ? sentAt.toISOString() : null,
    });
  });
}
