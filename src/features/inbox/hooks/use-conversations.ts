"use client";

import { useQuery } from "@tanstack/react-query";
import { inboxApi } from "@/features/inbox/api";
import { conversationListItemSchema, RawConversationRow } from "@/features/inbox/adapters";
import { fetchApi } from "@/lib/api";

type ConversationsApiResponse = {
  conversations: RawConversationRow[];
};
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const data = await fetchApi<ConversationsApiResponse>(inboxApi.conversations);

      return conversationListItemSchema.array().parse(data.conversations);
    },
  });
}
