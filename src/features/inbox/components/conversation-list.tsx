"use client";

import { useListConversations } from "@/features/inbox/hooks/use-conversations";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { ConversationListItem } from "@/features/inbox/components/conversation-list-item";
import { QueryBoundary } from "@/components/shared/query-boundary";

export function ConversationList() {
  const conversations = useListConversations();

  const { containerRef, sentinelRef } = useInfiniteScroll({
    hasNextPage: conversations.hasNextPage,
    isFetchingNextPage: conversations.isFetchingNextPage,
    onLoadMore: conversations.fetchNextPage,
  });

  return (
    <QueryBoundary
      isLoading={conversations.isLoading}
      isEmpty={(conversations.data ?? []).length === 0}
      scope="inbox"
      error={conversations.error}
    >
      <div ref={containerRef} className="h-full overflow-y-auto">
        <ul className="relative divide-y">
          {(conversations.data ?? []).map((conversation) => (
            <ConversationListItem key={conversation.id} conversation={conversation} />
          ))}
        </ul>
        <div ref={sentinelRef} className="h-px" />
      </div>
    </QueryBoundary>
  );
}
