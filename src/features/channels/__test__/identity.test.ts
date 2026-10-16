import { describe, expect, it } from "vitest";
import { extractDiscordContactIdentity } from "../discord/identity";
import { extractGmailContactIdentity } from "../gmail/identity";
import { extractSlackContactIdentity } from "../slack/identity";
import { normalizeEmail } from "../shared/normalize-email";
import type { DiscordMessage } from "../discord/types";
import type { GmailMessage } from "../gmail/types";
import type { SlackMessage } from "../slack/types";

const gmailWithFrom = (from: string): GmailMessage => ({
  id: "g1",
  threadId: "t1",
  snippet: "",
  payload: { headers: [{ name: "From", value: from }], body: { data: "", attachmentId: "" } },
});

const discordWithAuthor = (global_name: string): DiscordMessage => ({
  id: "1",
  channel_id: "c",
  author: { id: " 42 ", username: "bob", global_name },
  content: "",
  timestamp: "2025-01-01T00:00:00.000Z",
  attachments: [],
  type: 0,
});

describe("normalizeEmail", () => {
  it("trim et met en minuscules", () => {
    expect(normalizeEmail("  Foo@Bar.COM ")).toBe("foo@bar.com");
  });
});

describe("extractGmailContactIdentity", () => {
  it('extrait nom et email de "Nom <email>"', () => {
    expect(extractGmailContactIdentity(gmailWithFrom('"Alice D" <Alice@Ex.com>'))).toEqual({
      externalId: "alice@ex.com",
      displayHandle: "Alice D",
    });
  });

  it("utilise l'email comme handle quand il n'y a pas de nom", () => {
    expect(extractGmailContactIdentity(gmailWithFrom("bob@ex.com"))).toEqual({
      externalId: "bob@ex.com",
      displayHandle: "bob@ex.com",
    });
  });
});

describe("extractDiscordContactIdentity", () => {
  it("préfère global_name et trim l'id", () => {
    expect(extractDiscordContactIdentity(discordWithAuthor("Bob G"))).toEqual({
      externalId: "42",
      displayHandle: "Bob G",
    });
  });

  it("retombe sur username si global_name est vide", () => {
    expect(extractDiscordContactIdentity(discordWithAuthor("")).displayHandle).toBe("bob");
  });
});

describe("extractSlackContactIdentity", () => {
  it("renvoie l'id utilisateur sans handle", () => {
    const raw: SlackMessage = { type: "message", user: " U1 ", text: "", ts: "1" };
    expect(extractSlackContactIdentity(raw)).toEqual({ externalId: "U1", displayHandle: null });
  });
});
