"use client";

import { useParams } from "next/navigation";
import { QueryBoundary } from "../../../components/shared/Boundaries/query-boundary";
import { useListMessages } from "../hooks/use-messages";
import { Message } from "../adapters";
import { formatDate } from "../../../lib/date";
import { useLayoutEffect, useRef } from "react";
import { cn } from "../../../lib/utils";
import { ChannelBubble } from "../../../components/shared/channel-bubble";
import { useInfiniteScroll } from "../../../hooks/use-infinite-scroll";

const messageClass: Record<Message["direction"], string> = {
  inbound: "bg-card text-card-foreground border-border rounded-bl-md border",
  outbound: "ml-auto rounded-br-md bg-primary text-primary-foreground",
};
const detailClass: Record<Message["direction"], string> = {
  inbound: "",
  outbound: "justify-end",
};

export const MessagesList = () => {
  const { id } = useParams<{ id: string }>();
  const messages = useListMessages(id);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const { containerRef, sentinelRef } = useInfiniteScroll({
    hasNextPage: messages.hasNextPage,
    isFetchingNextPage: messages.isFetchingNextPage,
    isError: !!messages.error && messages.data !== undefined,
    onLoadMore: messages.fetchNextPage,
    direction: "top",
  });

  // Scroll en bas uniquement au premier chargement
  useLayoutEffect(() => {
    if (!hasScrolledRef.current && messages.data && messages.data.length > 0) {
      bottomRef.current?.scrollIntoView();
      hasScrolledRef.current = true;
    }
  }, [messages.data]);

  return (
    <QueryBoundary
      isLoading={messages.isLoading}
      isEmpty={(messages.data ?? []).length === 0}
      scope="thread"
      error={messages.error}
    >
      <div ref={containerRef} className="h-full overflow-y-auto">
        <div className="mx-auto flex max-w-[70%] flex-col gap-5 p-4">
          <div ref={sentinelRef} />
          {(messages.data ?? []).map((message) => (
            <div key={message.id}>
              <div
                className={cn(
                  "mb-2 flex items-center gap-1.5 px-1",
                  detailClass[message.direction],
                )}
              >
                <span className="text-muted-foreground/70 flex items-center gap-1.5 text-[10.5px] font-medium tracking-wide capitalize">
                  <ChannelBubble channel={message.channel} />
                  {message.channel}
                </span>
                <div className="text-muted-foreground/60 flex items-center gap-1 text-[11px]">
                  <span>-</span>
                  {formatDate(message.sentAt)}
                </div>
              </div>
              <div
                className={cn(
                  messageClass[message.direction],
                  "w-fit max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                )}
              >
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </QueryBoundary>
  );
};
