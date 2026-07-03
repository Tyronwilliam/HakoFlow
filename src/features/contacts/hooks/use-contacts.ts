"use client";

import { useQuery } from "@tanstack/react-query";
import { parseApiResponse } from "@/lib/api";
import { contactSchema } from "@/features/contacts/adapters";
import { contactsQueryOptions } from "@/features/contacts/queries";

export function useContacts() {
  return useQuery({
    ...contactsQueryOptions(),
    select: (data) =>
      parseApiResponse({
        schema: contactSchema.array(),
        data: data.contacts,
        context: "contacts.list",
      }),
  });
}
