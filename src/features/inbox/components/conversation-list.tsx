"use client";

import { useListConversations } from "@/features/inbox/hooks/use-conversations";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { ContactGroupListItem } from "@/features/inbox/components/contact-group-list-item";
import { QueryBoundary } from "../../../components/shared/Boundaries/query-boundary";
import { PaginationError } from "../../../components/shared/Boundaries/pagination-error";

export function ConversationList() {
  const conversations = useListConversations();

  const groups = conversations.data ?? [];

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

  const conversationCount = groups.reduce((count, group) => count + group.conversations.length, 0);

  return (
    <section className="border-border bg-background flex h-full w-95 shrink-0 flex-col overflow-hidden border-r">
      <QueryBoundary
        isLoading={conversations.isLoading}
        isEmpty={isConversationEmpty}
        scope="inbox"
        error={hasPreviousData ? null : conversations.error}
      >
        {!isConversationEmpty && (
          <div className="border-border text-muted-foreground border-b px-4 py-2.5 text-[12.5px] font-medium">
            {groups.length} contact{groups.length > 1 ? "s" : ""} · {conversationCount} conversation
            {conversationCount > 1 ? "s" : ""}
          </div>
        )}
        <div ref={containerRef} className="h-full overflow-y-auto">
          <ul className="relative divide-y">
            {groups.map((group) => (
              <ContactGroupListItem key={group.id} group={group} />
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
    </section>
  );
}
