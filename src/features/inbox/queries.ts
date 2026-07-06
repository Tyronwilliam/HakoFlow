import { API_INBOX } from "@/features/inbox/api";
import { ContactConversationGroup, ConversationListItem } from "@/features/inbox/adapters";
import { fetchApi } from "@/lib/api";

type ConversationsApiResponse = {
  groups: ContactConversationGroup[];
};

type UpdateConversationData = { id: ConversationListItem["id"] } & Partial<
  Omit<ConversationListItem, "id">
>;

const PAGE_SIZE = 20;

export const conversationsQueryKey = () => ["conversations"] as const;

export const conversationsQueryOptions = () => ({
  queryKey: conversationsQueryKey(),
  queryFn: async ({ pageParam }: { pageParam: number }) => {
    const startIndex = pageParam;
    const stopIndex = startIndex + PAGE_SIZE - 1;

    const data = await fetchApi<ConversationsApiResponse>(API_INBOX.GET(startIndex, stopIndex));

    return {
      groups: data.groups,
      nextCursor: data.groups.length === PAGE_SIZE ? startIndex + PAGE_SIZE : null,
    };
  },
  initialPageParam: 0,
  getNextPageParam: (lastPage: { nextCursor: number | null }) => lastPage.nextCursor,
});

export const conversationUpdateMutation = () => ({
  mutationFn: async (payload: UpdateConversationData) => {
    return fetchApi(API_INBOX.UPDATE(payload.id), {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
});
