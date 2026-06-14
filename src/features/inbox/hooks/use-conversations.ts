"use client";

import { useQuery } from "@tanstack/react-query";
import { inboxApi } from "@/features/inbox/api";
import { conversationListItemSchema } from "@/features/inbox/adapters";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await fetch(inboxApi.conversations);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load conversations");
      }

      return conversationListItemSchema.array().parse(data.conversations);
    },
  });
}
