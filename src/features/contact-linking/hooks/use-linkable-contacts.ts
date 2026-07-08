"use client";

import { useQuery } from "@tanstack/react-query";
import { linkableContactsQueryOptions } from "@/features/contact-linking/queries";
import { linkableContactSchema } from "@/features/contact-linking/adapters";
import { parseApiResponse } from "@/lib/api";

export function useLinkableContacts() {
  return useQuery({
    ...linkableContactsQueryOptions(),
    select: (data) =>
      parseApiResponse({
        schema: linkableContactSchema.array(),
        data,
        context: "contact-linking.contacts.list",
      }),
  });
}
