"use client";

import { useConversations } from "@/features/inbox/hooks/use-conversations";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { QueryBoundary } from "@/components/shared/query-boundary";
import { GraySpan } from "@/components/shared/Text/GraySpan";
import { PreviewText } from "@/components/shared/Text/PreviewText";
import { Name } from "@/components/shared/Text/Name";

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
  // Composant liste à faire
  // Check si button dans li ou li dans button
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
            <button
              className="hover:bg-secondary/40 relative flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
              key={conversation.id}
            >
              <li className="flex cursor-pointer flex-col gap-1 text-left">
                <Name content={conversation.contactName} />

                {conversation.contactHandle && (
                  <span className="mt-0.5 flex items-center gap-2 text-[12px]">
                    <ChannelBadge channel={conversation.channel} />
                    <GraySpan>{conversation.contactHandle}</GraySpan>
                  </span>
                )}
                <PreviewText>{conversation.lastMessagePreview}</PreviewText>
              </li>
            </button>
          ))}
        </ul>
        <div ref={sentinelRef} className="h-px" />
      </div>
    </QueryBoundary>
  );
}
