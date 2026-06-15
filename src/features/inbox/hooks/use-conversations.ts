"use client";

import { useQuery } from "@tanstack/react-query";
import { inboxApi } from "@/features/inbox/api";
import { conversationListItemSchema, RawConversationRow } from "@/features/inbox/adapters";
import { fetchApi } from "@/lib/api";

type ConversationsApiResponse = {
  conversations: RawConversationRow[];
};
export function useConversations(startIndex = 0, stopIndex = 2) {
  return useQuery({
    queryKey: ["conversations", startIndex, stopIndex],
    queryFn: async () => {
      const data = await fetchApi<ConversationsApiResponse>(
        inboxApi.conversations(startIndex, stopIndex),
      );

      return conversationListItemSchema.array().parse(data.conversations);
    },
  });
}
