import { z } from "zod";

export interface RawContactRow {
  id: string;
  name: string;
}

export function toContact(raw: RawContactRow): Contact {
  return {
    id: raw.id,
    name: raw.name,
  };
}

export const contactSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type Contact = z.infer<typeof contactSchema>;
