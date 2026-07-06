import { z } from "zod";

export interface RawMergeSuggestionRow {
  id: string;
  score: number;
  reason: string;
  contact_a: { id: string; name: string } | null;
  contact_b: { id: string; name: string } | null;
}

export function toMergeSuggestion(raw: RawMergeSuggestionRow): MergeSuggestion {
  return {
    id: raw.id,
    score: raw.score,
    reason: raw.reason,
    contactA: raw.contact_a ?? { id: "", name: "Contact inconnu" },
    contactB: raw.contact_b ?? { id: "", name: "Contact inconnu" },
  };
}

const mergeSuggestionContactSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const mergeSuggestionSchema = z.object({
  id: z.string(),
  score: z.number(),
  reason: z.string(),
  contactA: mergeSuggestionContactSchema,
  contactB: mergeSuggestionContactSchema,
});

export type MergeSuggestion = z.infer<typeof mergeSuggestionSchema>;

export interface RawLinkableContactRow {
  id: string;
  name: string;
  contact_channels: {
    id: string;
    provider: string;
    external_id: string;
    display_handle: string | null;
  }[];
}

export interface LinkableChannel {
  id: string;
  provider: string;
  externalId: string;
  displayHandle: string | null;
}

export interface LinkableContact {
  id: string;
  name: string;
  channels: LinkableChannel[];
}

export function toLinkableContact(raw: RawLinkableContactRow): LinkableContact {
  return {
    id: raw.id,
    name: raw.name,
    channels: raw.contact_channels.map((channel) => ({
      id: channel.id,
      provider: channel.provider,
      externalId: channel.external_id,
      displayHandle: channel.display_handle,
    })),
  };
}
