import { describe, expect, it } from "vitest";
import { messageSchema, toMessage } from "../adapters";

const raw = {
  id: "m1",
  channel: "discord",
  direction: "inbound",
  content: "hi",
  status: null,
  sent_at: null,
  read_at: null,
  expires_at: null,
  conversation_id: "cv1",
  external_id: null,
  attachment_urls: null,
};

describe("toMessage", () => {
  it("applique les défauts (status « sent », pièces jointes vides)", () => {
    const message = toMessage(raw);
    expect(message.status).toBe("sent");
    expect(message.attachmentUrls).toEqual([]);
    expect(message.conversationId).toBe("cv1");
    expect(() => messageSchema.parse(message)).not.toThrow();
  });

  it("le schéma rejette une direction invalide", () => {
    expect(() => messageSchema.parse({ ...toMessage(raw), direction: "sideways" })).toThrow();
  });
});
