"use client";

import { useQuery } from "@tanstack/react-query";
import { contactLinkHistoryQueryOptions } from "@/features/contact-linking/queries";
import { contactLinkHistorySchema } from "@/features/contact-linking/adapters";
import { parseApiResponse } from "@/lib/api";

export function useContactLinkHistory() {
  return useQuery({
    ...contactLinkHistoryQueryOptions(),
    select: (data) =>
      parseApiResponse({
        schema: contactLinkHistorySchema.array(),
        data,
        context: "contact-linking.history",
      }),
  });
}
