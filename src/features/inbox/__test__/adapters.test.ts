import { describe, expect, it } from "vitest";
import { contactConversationGroupSchema, toContactConversationGroup } from "../adapters";

describe("toContactConversationGroup", () => {
  const raw = {
    group_key: "g1",
    contact_name: "Alice",
    unread_conversations: "3",
    last_message_at: null,
    channels: ["gmail", "slack"],
    conversations: [
      {
        id: "cv1",
        primary_channel: "gmail",
        last_message_at: null,
        last_message_preview: null,
        unread_count: null,
        is_pinned: null,
        is_starred: true,
        contact_handle: "a@b.c",
      },
    ],
  };

  it("convertit les compteurs string et applique les défauts null", () => {
    const group = toContactConversationGroup(raw);
    expect(group.unreadConversationsCount).toBe(3);
    expect(group.conversations[0]).toMatchObject({
      contactName: "Alice",
      unreadCount: 0,
      isPinned: false,
      isStarred: true,
    });
  });

  it("produit un objet valide pour le schéma, qui rejette un canal inconnu", () => {
    const group = toContactConversationGroup(raw);
    expect(() => contactConversationGroupSchema.parse(group)).not.toThrow();
    expect(() => contactConversationGroupSchema.parse({ ...group, channels: ["sms"] })).toThrow();
  });
});
