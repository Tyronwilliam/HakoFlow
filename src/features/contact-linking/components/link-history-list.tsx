"use client";

import { QueryBoundary } from "@/components/shared/Boundaries/query-boundary";
import { useContactLinkHistory } from "@/features/contact-linking/hooks/use-contact-link-history";
import { LinkHistoryRow } from "@/features/contact-linking/components/link-history-row";

export function LinkHistoryList() {
  const history = useContactLinkHistory();

  return (
    <QueryBoundary
      isLoading={history.isLoading}
      isEmpty={(history.data ?? []).length === 0}
      scope="historique des rattachements"
      error={history.error}
      emptyTitle="Aucun rattachement"
      emptyDescription="Aucun canal n'a encore été rattaché manuellement à un contact."
    >
      <div className="flex flex-col gap-1">
        {(history.data ?? []).map((entry) => (
          <LinkHistoryRow key={entry.id} entry={entry} />
        ))}
      </div>
    </QueryBoundary>
  );
}
