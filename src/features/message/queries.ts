import { fetchApi } from "../../lib/api";
import { RawMessageRow } from "./adapters";
import { API_MESSAGES } from "./api";

type MessagesApiResponse = {
  messages: RawMessageRow[];
};

const PAGE_SIZE = 20;

export const messagesQueryKey = (conversationId: string) => ["messages", conversationId] as const;

export const messagesQueryOptions = (conversationId: string) => ({
  queryKey: messagesQueryKey(conversationId),
  queryFn: async ({ pageParam }: { pageParam: number }) => {
    const startIndex = pageParam;
    const stopIndex = startIndex + PAGE_SIZE - 1;

    const data = await fetchApi<MessagesApiResponse>(
      API_MESSAGES.GET(conversationId, startIndex, stopIndex),
    );

    return {
      messages: data.messages,
      nextCursor: data.messages.length === PAGE_SIZE ? startIndex + PAGE_SIZE : null,
    };
  },
  initialPageParam: 0,
  getNextPageParam: (lastPage: { nextCursor: number | null }) => lastPage.nextCursor,
});
