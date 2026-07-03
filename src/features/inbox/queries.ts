import { API_INBOX } from "@/features/inbox/api";
import {
  ConversationListItem,
  RawConversationRow,
  UnlinkedConversationOption,
  ConversationDetail,
} from "@/features/inbox/adapters";
import { fetchApi } from "@/lib/api";

type ConversationsApiResponse = {
  conversations: RawConversationRow[];
};

type UnlinkedConversationsApiResponse = {
  conversations: UnlinkedConversationOption[];
};

type ConversationDetailApiResponse = {
  conversation: ConversationDetail;
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
      conversations: data.conversations,
      nextCursor: data.conversations.length === PAGE_SIZE ? startIndex + PAGE_SIZE : null,
    };
  },
  initialPageParam: 0,
  getNextPageParam: (lastPage: { nextCursor: number | null }) => lastPage.nextCursor,
});

export const unlinkedConversationsQueryKey = () => ["conversations", "unlinked"] as const;

export const unlinkedConversationsQueryOptions = () => ({
  queryKey: unlinkedConversationsQueryKey(),
  queryFn: () => fetchApi<UnlinkedConversationsApiResponse>(API_INBOX.LIST_UNLINKED()),
});

export const conversationDetailQueryKey = (id: ConversationListItem["id"]) =>
  ["conversation", id] as const;

export const conversationDetailQueryOptions = (id: ConversationListItem["id"]) => ({
  queryKey: conversationDetailQueryKey(id),
  queryFn: () => fetchApi<ConversationDetailApiResponse>(API_INBOX.GET_ONE(id)),
});

export const conversationUpdateMutation = () => ({
  mutationFn: async (payload: UpdateConversationData) => {
    return fetchApi(API_INBOX.UPDATE(payload.id), {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
});
