import { describe, expect, it } from "vitest";
import {
  contactMergeSchema,
  toContactLinkHistory,
  toContactMerge,
  toLinkableContact,
  toMergeSuggestion,
} from "../adapters";

const contact = { id: "c1", name: "Alice" };

describe("contact-linking adapters", () => {
  it("toMergeSuggestion remplace un contact null par « Contact inconnu »", () => {
    const result = toMergeSuggestion({
      id: "s1",
      score: 0.9,
      reason: "même email",
      contact_a: contact,
      contact_b: null,
    });
    expect(result.contactA).toEqual(contact);
    expect(result.contactB).toEqual({ id: "", name: "Contact inconnu" });
  });

  it("toLinkableContact passe les canaux en camelCase", () => {
    const result = toLinkableContact({
      id: "c1",
      name: "Alice",
      contact_channels: [
        { id: "ch1", provider: "gmail", external_id: "a@b.c", display_handle: null },
      ],
    });
    expect(result.channels).toEqual([
      { id: "ch1", provider: "gmail", externalId: "a@b.c", displayHandle: null },
    ]);
  });

  it("toContactMerge compte les éléments déplacés et produit un objet valide", () => {
    const result = toContactMerge({
      id: "m1",
      merged_at: "2025-01-01T00:00:00Z",
      undone_at: null,
      moved_contact_channel_ids: ["a", "b"],
      moved_conversation_ids: ["x"],
      target_contact: contact,
      source_contact: null,
    });
    expect(result.movedContactChannelsCount).toBe(2);
    expect(result.movedConversationsCount).toBe(1);
    expect(() => contactMergeSchema.parse(result)).not.toThrow();
  });

  it("toContactLinkHistory mappe les champs snake_case", () => {
    const result = toContactLinkHistory({
      id: "l1",
      provider: "slack",
      linked_at: "2025-01-01T00:00:00Z",
      undone_at: "2025-01-02T00:00:00Z",
      moved_conversation_ids: [],
      target_contact: contact,
      source_contact: contact,
    });
    expect(result).toMatchObject({
      linkedAt: "2025-01-01T00:00:00Z",
      undoneAt: "2025-01-02T00:00:00Z",
      movedConversationsCount: 0,
    });
  });
});
