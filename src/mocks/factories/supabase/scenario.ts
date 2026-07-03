import { faker } from "@faker-js/faker";
import type { ChannelListType, ContactRow, ContactChannelRow } from "@/types";
import { createContactRow } from "./tables/contacts";
import { createContactChannelRow } from "./tables/contact-channels";
import { createConversationRow } from "./tables/conversations";
import { createMessageRow } from "./tables/messages";
import { ConversationRow } from "../../../features/inbox/types";
import { MessageRow } from "../../../features/message/types";

const CHANNELS: ChannelListType[] = ["gmail", "discord", "slack"];

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

  function addConversation(contactId: string | null, channel: ChannelListType) {
    const conversation = createConversationRow({
      workspace_id: workspaceId,
      contact_id: contactId,
      primary_channel: channel,
    });

    const thread = createMessageThread(conversation.id, channel);
    messages.push(...thread);

    const lastMessage = thread[thread.length - 1];

    conversations.push({
      ...conversation,
      last_message_at: lastMessage.sent_at,
      last_message_preview: lastMessage.content.slice(0, 60),
      unread_count: thread.filter(
        (m) => m.direction === ("inbound" as MessageRow["direction"]) && !m.read_at,
      ).length,
    });
  }

  for (let i = 0; i < contactCount; i++) {
    const contact = createContactRow({ workspace_id: workspaceId });
    contacts.push(contact);

    const channels = faker.helpers.arrayElements(CHANNELS, { min: 1, max: CHANNELS.length });

    for (const channel of channels) {
      contactChannels.push(
        createContactChannelRow({
          contact_id: contact.id,
          workspace_id: workspaceId,
          provider: channel,
        }),
      );

      const conversationCount = faker.number.int({ min: 1, max: 2 });

      for (let c = 0; c < conversationCount; c++) {
        addConversation(contact.id, channel);
      }
    }
  }

  // Unlinked conversations: no contact_id yet, so they exercise the
  // "group under a contact" wizard (src/features/contacts/components/
  // group-conversations-wizard.tsx). Several per provider so a contact
  // can be linked to more than one identifier of the same provider
  // (e.g. 3 Gmail addresses under one contact).
  for (const channel of CHANNELS) {
    const unlinkedCount = faker.number.int({ min: 2, max: 4 });
    for (let u = 0; u < unlinkedCount; u++) {
      addConversation(null, channel);
    }
  }

  return { contacts, contactChannels, conversations, messages };
}

function createMessageThread(conversationId: string, channel: ChannelListType): MessageRow[] {
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
