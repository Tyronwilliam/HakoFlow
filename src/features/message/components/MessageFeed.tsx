import { useInfiniteScroll } from "../../../hooks/use-infinite-scroll";
import { MessageCard } from "./MessageCard";
import { MessageMetadata } from "./MessageMetadata";

import { useLayoutEffect, useRef } from "react";
import { useListMessages } from "../hooks/use-messages";

export const MessageFeed = ({ messages }: { messages: ReturnType<typeof useListMessages> }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  // Scroll en bas uniquement au premier chargement
  useLayoutEffect(() => {
    if (!hasScrolledRef.current && messages.data && messages.data.length > 0) {
      bottomRef.current?.scrollIntoView();
      hasScrolledRef.current = true;
    }
  }, [messages.data]);

  const { containerRef, sentinelRef } = useInfiniteScroll({
    hasNextPage: messages.hasNextPage,
    isFetchingNextPage: messages.isFetchingNextPage,
    isError: !!messages.error && messages.data !== undefined,
    onLoadMore: messages.fetchNextPage,
    direction: "top",
  });

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-[70%] flex-col gap-5 p-4">
        <div ref={sentinelRef} />
        {(messages.data ?? []).map((message) => (
          <div key={message.id}>
            <MessageMetadata message={message} />
            <MessageCard message={message} />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
