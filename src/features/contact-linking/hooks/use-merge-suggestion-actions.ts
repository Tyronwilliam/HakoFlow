"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ignoreMergeSuggestionMutation,
  mergeSuggestionMutation,
  mergeSuggestionsQueryKey,
} from "@/features/contact-linking/queries";
import { conversationsQueryKey } from "@/features/inbox/queries";

export function useMergeSuggestionActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: mergeSuggestionsQueryKey() });

  const ignore = useMutation({
    ...ignoreMergeSuggestionMutation(),
    onSuccess: invalidate,
  });

  const merge = useMutation({
    ...mergeSuggestionMutation(),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: conversationsQueryKey() });
    },
  });

  return { ignore, merge };
}
