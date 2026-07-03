"use client";

import { useQuery } from "@tanstack/react-query";
import { unlinkedConversationsQueryOptions } from "@/features/inbox/queries";
import { unlinkedConversationOptionSchema } from "@/features/inbox/adapters";
import { parseApiResponse } from "@/lib/api";

export const useUnlinkedConversations = () => {
  return useQuery({
    ...unlinkedConversationsQueryOptions(),
    select: (data) =>
      parseApiResponse({
        schema: unlinkedConversationOptionSchema.array(),
        data: data.conversations,
        context: "conversations.unlinked",
      }),
  });
};
