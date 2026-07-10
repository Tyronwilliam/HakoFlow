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

export interface DuplicateContactPair {
  a: ContactRow;
  b: ContactRow;
}

export interface WorkspaceScenario {
  contacts: ContactRow[];
  contactChannels: ContactChannelRow[];
  conversations: ConversationRow[];
  messages: MessageRow[];
  /**
   * Paires de contacts au nom quasi-identique (ex: "Marie Dupont" /
   * "Marie Dupond"), volontairement non rattachées entre elles. Elles
   * existent pour que `generate_merge_suggestions` (similarité pg_trgm sur
   * `name`) les détecte réellement, plutôt que de dépendre du hasard des
   * noms générés par faker sur le reste du scénario.
   */
  duplicatePairs: DuplicateContactPair[];
}

/**
 * Crée un contact avec un sous-ensemble de canaux et leurs conversations/
 * messages associés, et pousse le tout dans les accumulateurs fournis.
 */
function createContactWithActivity(
  workspaceId: string,
  contact: ContactRow,
  accumulators: {
    contactChannels: ContactChannelRow[];
    conversations: ConversationRow[];
    messages: MessageRow[];
  },
  channelCount: { min: number; max: number } = { min: 1, max: CHANNELS.length },
): void {
  const channels = faker.helpers.arrayElements(CHANNELS, channelCount);

  for (const channel of channels) {
    accumulators.contactChannels.push(
      createContactChannelRow({
        contact_id: contact.id,
        workspace_id: workspaceId,
        provider: channel,
      }),
    );

    const conversationCount = faker.number.int({ min: 1, max: 2 });

    for (let c = 0; c < conversationCount; c++) {
      const conversation = createConversationRow({
        workspace_id: workspaceId,
        contact_id: contact.id,
        primary_channel: channel,
      });

      const thread = createMessageThread(conversation.id, channel);
      accumulators.messages.push(...thread);

      const lastMessage = thread[thread.length - 1];

      accumulators.conversations.push({
        ...conversation,
        last_message_at: lastMessage.sent_at,
        last_message_preview: lastMessage.content.slice(0, 60),
        unread_count: thread.filter(
          (m) => m.direction === ("inbound" as MessageRow["direction"]) && !m.read_at,
        ).length,
      });
    }
  }
}

export function createWorkspaceScenario(
  workspaceId: string,
  contactCount = 5,
  duplicatePairCount = 3,
): WorkspaceScenario {
  const contacts: ContactRow[] = [];
  const contactChannels: ContactChannelRow[] = [];
  const conversations: ConversationRow[] = [];
  const messages: MessageRow[] = [];
  const duplicatePairs: DuplicateContactPair[] = [];

  for (let i = 0; i < contactCount; i++) {
    const contact = createContactRow({ workspace_id: workspaceId });
    contacts.push(contact);

    createContactWithActivity(workspaceId, contact, { contactChannels, conversations, messages });
  }

  for (let i = 0; i < duplicatePairCount; i++) {
    const baseName = faker.person.fullName();

    const contactA = createContactRow({ workspace_id: workspaceId, name: baseName });
    const contactB = createContactRow({
      workspace_id: workspaceId,
      name: misspellName(baseName),
    });

    contacts.push(contactA, contactB);
    // Un seul canal chacun : ce sont deux identités distinctes du même
    // contact réel (ex: reçu par email puis par Discord), pas un doublon
    // exact — c'est justement ce que la fusion doit réconcilier.
    createContactWithActivity(
      workspaceId,
      contactA,
      { contactChannels, conversations, messages },
      { min: 1, max: 1 },
    );
    createContactWithActivity(
      workspaceId,
      contactB,
      { contactChannels, conversations, messages },
      { min: 1, max: 1 },
    );

    duplicatePairs.push({ a: contactA, b: contactB });
  }

  return { contacts, contactChannels, conversations, messages, duplicatePairs };
}

/**
 * Introduit une variation mineure dans un nom (accent/lettre supprimée ou
 * dupliquée) pour simuler une même personne saisie légèrement différemment
 * selon le canal, tout en restant au-dessus du seuil de similarité pg_trgm
 * par défaut (0.4) utilisé par `generate_merge_suggestions`.
 */
function misspellName(name: string): string {
  const index = faker.number.int({ min: 1, max: name.length - 2 });
  return `${name.slice(0, index)}${name[index]}${name.slice(index)}`;
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
