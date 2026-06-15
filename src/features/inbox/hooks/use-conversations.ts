"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { inboxApi } from "@/features/inbox/api";
import { conversationListItemSchema, RawConversationRow } from "@/features/inbox/adapters";
import { fetchApi } from "@/lib/api";

type ConversationsApiResponse = {
  conversations: RawConversationRow[];
};

const PAGE_SIZE = 20;

export function useConversations() {
  return useInfiniteQuery({
    queryKey: ["conversations"],
    queryFn: async ({ pageParam }) => {
      const startIndex = pageParam;
      const stopIndex = startIndex + PAGE_SIZE - 1;

      const data = await fetchApi<ConversationsApiResponse>(
        inboxApi.conversations(startIndex, stopIndex),
      );

      const conversations = conversationListItemSchema.array().parse(data.conversations);

      return {
        conversations,
        nextCursor: conversations.length === PAGE_SIZE ? startIndex + PAGE_SIZE : null,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
