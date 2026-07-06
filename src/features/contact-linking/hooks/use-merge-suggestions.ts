"use client";

import { useQuery } from "@tanstack/react-query";
import { mergeSuggestionsQueryOptions } from "@/features/contact-linking/queries";

export function useMergeSuggestions() {
  return useQuery(mergeSuggestionsQueryOptions());
}
