"use client";

import { useConversations } from "@/features/inbox/hooks/use-conversations";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { ConversationListItem } from "@/features/inbox/components/conversation-list-item";
import { QueryBoundary } from "@/components/shared/query-boundary";

export function ConversationList() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversations();

  const conversations = data?.pages.flatMap((page) => page.conversations) ?? [];

  const { containerRef, sentinelRef } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    onLoadMore: fetchNextPage,
  });

  // Faire une substring sur les conversation venant des API Channel 60 caractere
  return (
    <QueryBoundary
      isLoading={isLoading}
      isEmpty={conversations.length === 0}
      scope="inbox"
      error={error}
    >
      <div ref={containerRef} className="h-full overflow-y-auto">
        <ul className="relative divide-y">
          {conversations.map((conversation) => (
            <ConversationListItem key={conversation.id} conversation={conversation} />
          ))}
        </ul>
        <div ref={sentinelRef} className="h-px" />
      </div>
    </QueryBoundary>
  );
}
