import type { ContactIdentity } from "@/features/channels/shared/types";
import { normalizeEmail } from "@/features/channels/shared/normalize-email";
import type { GmailMessage } from "@/features/channels/gmail/types";

const FROM_HEADER_PATTERN = /^(?:"?([^"<]*)"?\s*<)?([^\s<>]+@[^\s<>]+)>?$/;

export function extractGmailContactIdentity(raw: GmailMessage): ContactIdentity {
  const fromHeader = raw.payload.headers.find((header) => header.name === "From")?.value ?? "";
  const match = fromHeader.match(FROM_HEADER_PATTERN);
  const name = match?.[1]?.trim();
  const email = match?.[2] ?? fromHeader.trim();

  return {
    externalId: normalizeEmail(email),
    displayHandle: name && name.length > 0 ? name : email,
  };
}
