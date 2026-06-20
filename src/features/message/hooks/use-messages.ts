"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { UseInfiniteQueryOptions } from "@tanstack/react-query";
import { messagesQueryKey, messagesQueryOptions } from "../queries";
import { parseApiResponse } from "../../../lib/api";
import { Message, messageSchema } from "../adapters";

type MessagePage = Awaited<ReturnType<ReturnType<typeof messagesQueryOptions>["queryFn"]>>;

type ListMessagesOptions = Partial<
  UseInfiniteQueryOptions<
    MessagePage,
    Error,
    Message[],
    ReturnType<typeof messagesQueryKey>,
    number
  >
>;

export const useListMessages = (conversationId: string, options?: ListMessagesOptions) => {
  return useInfiniteQuery<
    MessagePage,
    Error,
    Message[],
    ReturnType<typeof messagesQueryKey>,
    number
  >({
    ...messagesQueryOptions(conversationId),
    ...options,
    select: (data) =>
      parseApiResponse({
        schema: messageSchema.array(),
        data: data.pages.flatMap((p: MessagePage) => p.messages),
        context: "messages.list",
      }),
  });
};
