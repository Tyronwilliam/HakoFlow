"use client";

import { useQuery } from "@tanstack/react-query";
import { contactMergesQueryOptions } from "@/features/contact-linking/queries";
import { contactMergeSchema } from "@/features/contact-linking/adapters";
import { parseApiResponse } from "@/lib/api";

export function useContactMerges() {
  return useQuery({
    ...contactMergesQueryOptions(),
    select: (data) =>
      parseApiResponse({
        schema: contactMergeSchema.array(),
        data,
        context: "contact-merges.list",
      }),
  });
}
