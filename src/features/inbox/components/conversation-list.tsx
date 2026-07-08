"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useListConversations } from "@/features/inbox/hooks/use-conversations";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { ContactGroupListItem } from "@/features/inbox/components/contact-group-list-item";
import { ContactGroupDetail } from "@/features/inbox/components/contact-group-detail";
import { QueryBoundary } from "../../../components/shared/Boundaries/query-boundary";
import { PaginationError } from "../../../components/shared/Boundaries/pagination-error";

export function ConversationList() {
  const conversations = useListConversations();
  const params = useParams();
  const [manualView, setManualView] = useState<string | null | undefined>(undefined);

  const groups = conversations.data ?? [];

  const routeGroup = groups.find(
    (group) =>
      group.conversations.length > 1 &&
      group.conversations.some((conversation) => conversation.id === params.id),
  );

  const activeGroupId = manualView !== undefined ? manualView : (routeGroup?.id ?? null);
  const activeGroup = activeGroupId ? groups.find((group) => group.id === activeGroupId) : null;

  const hasPreviousData = conversations.data !== undefined;
  const isConversationEmpty = groups.length === 0;

  const { containerRef, sentinelRef } = useInfiniteScroll({
    hasNextPage: conversations.hasNextPage,
    isFetchingNextPage: conversations.isFetchingNextPage,
    isError: !!conversations.error && hasPreviousData,
    onLoadMore: conversations.fetchNextPage,
  });

  const tryFetchNextPage = () => {
    conversations.fetchNextPage();
  };

  return (
    <section className="border-border bg-background flex h-full w-95 shrink-0 flex-col overflow-hidden border-r">
      {activeGroup ? (
        <ContactGroupDetail group={activeGroup} onBack={() => setManualView(null)} />
      ) : (
        <QueryBoundary
          isLoading={conversations.isLoading}
          isEmpty={isConversationEmpty}
          scope="inbox"
          error={hasPreviousData ? null : conversations.error}
        >
          <div ref={containerRef} className="h-full overflow-y-auto">
            <ul className="relative divide-y">
              {groups.map((group) => (
                <ContactGroupListItem
                  key={group.id}
                  group={group}
                  onOpen={() => setManualView(group.id)}
                />
              ))}
            </ul>
            <PaginationError
              error={conversations.error}
              hasPreviousData={hasPreviousData}
              onRetry={tryFetchNextPage}
            />
            <div ref={sentinelRef} className="h-px" />
          </div>
        </QueryBoundary>
      )}
    </section>
  );
}
