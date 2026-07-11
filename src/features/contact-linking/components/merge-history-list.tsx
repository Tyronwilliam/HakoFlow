"use client";

import { QueryBoundary } from "@/components/shared/Boundaries/query-boundary";
import { useContactMerges } from "@/features/contact-linking/hooks/use-contact-merges";
import { MergeHistoryRow } from "@/features/contact-linking/components/merge-history-row";

export function MergeHistoryList() {
  const merges = useContactMerges();

  return (
    <QueryBoundary
      isLoading={merges.isLoading}
      isEmpty={(merges.data ?? []).length === 0}
      scope="historique des fusions"
      error={merges.error}
      emptyTitle="Aucune fusion"
      emptyDescription="Aucune fusion de contacts n'a encore été effectuée."
    >
      <div className="flex flex-col gap-1">
        {(merges.data ?? []).map((merge) => (
          <MergeHistoryRow key={merge.id} merge={merge} />
        ))}
      </div>
    </QueryBoundary>
  );
}
