"use client";

import { QueryBoundary } from "@/components/shared/Boundaries/query-boundary";
import { useMergeSuggestions } from "@/features/contact-linking/hooks/use-merge-suggestions";
import { MergeSuggestionCard } from "@/features/contact-linking/components/merge-suggestion-card";

export function MergeSuggestionsList() {
  const suggestions = useMergeSuggestions();

  return (
    <QueryBoundary
      isLoading={suggestions.isLoading}
      isEmpty={(suggestions.data ?? []).length === 0}
      scope="suggestions de fusion"
      error={suggestions.error}
      emptyTitle="Aucune suggestion"
      emptyDescription="Aucun contact ne semble dupliqué à travers plusieurs canaux pour l'instant."
    >
      <div className="flex flex-col gap-3">
        {(suggestions.data ?? []).map((suggestion) => (
          <MergeSuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </QueryBoundary>
  );
}
