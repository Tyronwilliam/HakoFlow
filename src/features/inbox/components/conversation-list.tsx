"use client";

import { useListConversations } from "@/features/inbox/hooks/use-conversations";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { ConversationListItem } from "@/features/inbox/components/conversation-list-item";
import { QueryBoundary } from "../../../components/shared/Boundaries/query-boundary";
import { PaginationError } from "../../../components/shared/Boundaries/pagination-error";

export function ConversationList() {
  const conversations = useListConversations();

  const flatConversations = (conversations.data ?? []).flatMap((group) => group.conversations);

  const hasPreviousData = conversations.data !== undefined;
  const isConversationEmpty = flatConversations.length === 0;

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
      <QueryBoundary
        isLoading={conversations.isLoading}
        isEmpty={isConversationEmpty}
        scope="inbox"
        error={hasPreviousData ? null : conversations.error}
      >
        <div ref={containerRef} className="h-full overflow-y-auto">
          <ul className="relative divide-y">
            {flatConversations.map((conversation) => (
              <ConversationListItem key={conversation.id} conversation={conversation} />
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
