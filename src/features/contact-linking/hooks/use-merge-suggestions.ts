"use client";

import { useQuery } from "@tanstack/react-query";
import { mergeSuggestionsQueryOptions } from "@/features/contact-linking/queries";
import { mergeSuggestionSchema } from "@/features/contact-linking/adapters";
import { parseApiResponse } from "@/lib/api";

export function useMergeSuggestions() {
  return useQuery({
    ...mergeSuggestionsQueryOptions(),
    select: (data) =>
      parseApiResponse({
        schema: mergeSuggestionSchema.array(),
        data,
        context: "merge-suggestions.list",
      }),
  });
}
