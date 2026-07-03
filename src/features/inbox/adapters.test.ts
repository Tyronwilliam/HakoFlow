import { describe, expect, it } from "vitest";
import { toConversationListItem, type RawConversationRow } from "./adapters";

function makeRaw(overrides: Partial<RawConversationRow> = {}): RawConversationRow {
  return {
    id: "conversation-1",
    primary_channel: "gmail",
    external_id: "marie@gmail.com",
    last_message_at: null,
    last_message_preview: null,
    unread_count: 0,
    is_pinned: false,
    is_starred: false,
    contacts: null,
    ...overrides,
  };
}

describe("toConversationListItem", () => {
  it("picks the channel matching both provider and external_id when a contact has several channels of the same provider", () => {
    const raw = makeRaw({
      contacts: {
        name: "Marie",
        contact_channels: [
          { provider: "gmail", external_id: "marie.pro@gmail.com", display_handle: "Marie (pro)" },
          { provider: "gmail", external_id: "marie@gmail.com", display_handle: "Marie (perso)" },
        ],
      },
    });

    const item = toConversationListItem(raw);

    expect(item.contactHandle).toBe("Marie (perso)");
  });

  it("falls back to a null contactHandle when no channel matches the conversation's external_id", () => {
    const raw = makeRaw({
      external_id: "marie@gmail.com",
      contacts: {
        name: "Marie",
        contact_channels: [
          {
            provider: "gmail",
            external_id: "someone-else@gmail.com",
            display_handle: "Someone else",
          },
        ],
      },
    });

    const item = toConversationListItem(raw);

    expect(item.contactHandle).toBeNull();
  });

  it('defaults contactName to "Inconnu" when the conversation has no linked contact', () => {
    const item = toConversationListItem(makeRaw({ contacts: null }));

    expect(item.contactName).toBe("Inconnu");
    expect(item.contactHandle).toBeNull();
  });
});
