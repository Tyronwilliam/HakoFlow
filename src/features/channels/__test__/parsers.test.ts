import { describe, expect, it } from "vitest";
import { parseDiscordMessage } from "../discord/parser";
import { parseGmailMessage } from "../gmail/parser";
import { parseSlackMessage } from "../slack/parser";
import type { DiscordMessage } from "../discord/types";
import type { GmailMessage } from "../gmail/types";
import type { SlackMessage } from "../slack/types";

describe("parseDiscordMessage", () => {
  const raw: DiscordMessage = {
    id: "111",
    channel_id: "c1",
    author: { id: "u1", username: "alice", global_name: "Alice" },
    content: "Salut",
    timestamp: "2025-01-02T03:04:05.000Z",
    attachments: [],
    type: 0,
  };

  it("mappe un message Discord vers une MessageRow inbound", () => {
    const row = parseDiscordMessage(raw, "conv-1");
    expect(row).toMatchObject({
      conversation_id: "conv-1",
      external_id: "111",
      channel: "discord",
      direction: "inbound",
      content: "Salut",
      status: "delivered",
      sent_at: "2025-01-02T03:04:05.000Z",
      read_at: null,
    });
  });

  it("génère un id unique à chaque appel", () => {
    expect(parseDiscordMessage(raw, "c").id).not.toBe(parseDiscordMessage(raw, "c").id);
  });
});

describe("parseGmailMessage", () => {
  const build = (headers: GmailMessage["payload"]["headers"]): GmailMessage => ({
    id: "g1",
    threadId: "t1",
    snippet: "",
    payload: {
      headers,
      body: { data: Buffer.from("Bonjour é", "utf-8").toString("base64url"), attachmentId: "" },
    },
  });

  it("décode le corps base64url et lit le header Date", () => {
    const row = parseGmailMessage(
      build([{ name: "Date", value: "Thu, 02 Jan 2025 03:04:05 GMT" }]),
      "conv-1",
    );
    expect(row.content).toBe("Bonjour é");
    expect(row.sent_at).toBe("2025-01-02T03:04:05.000Z");
    expect(row.channel).toBe("gmail");
    expect(row.external_id).toBe("g1");
  });

  it("throw si le header Date est absent (date invalide)", () => {
    expect(() => parseGmailMessage(build([]), "conv-1")).toThrow(RangeError);
  });
});

describe("parseSlackMessage", () => {
  const raw: SlackMessage = { type: "message", user: "U1", text: "Hello", ts: "1735787045.000200" };

  it("utilise ts comme external_id et le convertit en date", () => {
    const row = parseSlackMessage(raw, "conv-1");
    expect(row.external_id).toBe("1735787045.000200");
    expect(row.sent_at).toBe(new Date(1735787045000.2).toISOString());
    expect(row.channel).toBe("slack");
    expect(row.content).toBe("Hello");
  });
});
