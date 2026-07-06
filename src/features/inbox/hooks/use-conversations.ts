"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseInfiniteQueryOptions, MutationOptions, InfiniteData } from "@tanstack/react-query";
import {
  conversationsQueryOptions,
  conversationsQueryKey,
  conversationUpdateMutation,
} from "@/features/inbox/queries";
import type { ContactConversationGroup } from "@/features/inbox/adapters";
import {
  contactConversationGroupSchema,
  toContactConversationGroup,
} from "@/features/inbox/adapters";
import { parseApiResponse } from "@/lib/api";

type ConversationPage = Awaited<
  ReturnType<ReturnType<typeof conversationsQueryOptions>["queryFn"]>
>;

type ListConversationsOptions = Partial<
  UseInfiniteQueryOptions<
    ConversationPage,
    Error,
    ContactConversationGroup[],
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
        schema: contactConversationGroupSchema.array(),
        data: data.pages.flatMap((p: ConversationPage) => p.groups.map(toContactConversationGroup)),
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

type ConversationsCache = InfiniteData<ConversationPage>;

export const useUpdateConversation = (options?: UpdateConversationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    ...conversationUpdateMutation(),
    ...options,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: conversationsQueryKey() });

      const snapshot = queryClient.getQueryData<ConversationsCache>(conversationsQueryKey());

      queryClient.setQueryData<ConversationsCache>(conversationsQueryKey(), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            groups: page.groups.map((group) => {
              if (!group.conversations.some((conv) => conv.id === variables.id)) return group;

              const conversations = group.conversations.map((conv) =>
                conv.id === variables.id ? { ...conv, unread_count: 0 } : conv,
              );

              return {
                ...group,
                conversations,
                total_unread: conversations.reduce(
                  (sum, conv) => sum + (conv.unread_count ?? 0),
                  0,
                ),
              };
            }),
          })),
        };
      });

      return { snapshot };
    },
    onError: (_err, _variables, context) => {
      const ctx = context as { snapshot?: ConversationsCache } | undefined;
      if (ctx?.snapshot) {
        queryClient.setQueryData(conversationsQueryKey(), ctx.snapshot);
      }
    },
    onSettled: (...args) => {
      queryClient.invalidateQueries({ queryKey: conversationsQueryKey() });
      options?.onSettled?.(...args);
    },
  });
};
