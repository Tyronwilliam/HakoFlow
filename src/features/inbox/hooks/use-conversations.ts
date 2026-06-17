"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseInfiniteQueryOptions, MutationOptions } from "@tanstack/react-query";
import {
  conversationsQueryOptions,
  conversationsQueryKey,
  conversationUpdateMutation,
} from "@/features/inbox/queries";
import type { ConversationListItem } from "@/features/inbox/adapters";
import { conversationListItemSchema } from "@/features/inbox/adapters";
import { parseApiResponse } from "@/lib/api";

type ConversationPage = Awaited<
  ReturnType<ReturnType<typeof conversationsQueryOptions>["queryFn"]>
>;

type ListConversationsOptions = Partial<
  UseInfiniteQueryOptions<
    ConversationPage,
    Error,
    ConversationListItem[],
    ReturnType<typeof conversationsQueryKey>,
    number
  >
>;

export const useListConversations = (options?: ListConversationsOptions) => {
  return useInfiniteQuery({
    ...conversationsQueryOptions(),
    ...options,
    select: (data) =>
      parseApiResponse({
        schema: conversationListItemSchema.array(),
        data: data.pages.flatMap((p: ConversationPage) => p.conversations),
        context: "conversations.list",
      }),
  });
};

type UpdateConversationOptions = Partial<
  MutationOptions<
    unknown,
    Error,
    Parameters<ReturnType<typeof conversationUpdateMutation>["mutationFn"]>[0]
  >
>;

export const useUpdateConversation = (options?: UpdateConversationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...conversationUpdateMutation(),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: conversationsQueryKey() });
      options?.onSuccess?.(...args);
    },
  });
};
