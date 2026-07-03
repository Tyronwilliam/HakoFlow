"use client";

import { useQuery } from "@tanstack/react-query";
import { conversationDetailQueryOptions } from "@/features/inbox/queries";
import { conversationDetailSchema } from "@/features/inbox/adapters";
import { parseApiResponse } from "@/lib/api";
import type { ConversationListItem } from "@/features/inbox/adapters";

export const useConversationDetail = (id: ConversationListItem["id"]) => {
  return useQuery({
    ...conversationDetailQueryOptions(id),
    select: (data) =>
      parseApiResponse({
        schema: conversationDetailSchema,
        data: data.conversation,
        context: "conversation.detail",
      }),
  });
};
