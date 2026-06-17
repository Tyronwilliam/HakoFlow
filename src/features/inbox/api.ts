import { ConversationListItem } from "./adapters";

export const inboxApi = {
  conversations: (startIndex: number, stopIndex: number) =>
    `/api/conversations?startIndex=${startIndex}&stopIndex=${stopIndex}`,
  update: (conversationId: ConversationListItem["id"]) => `/api/conversations/${conversationId}`,
} as const;
