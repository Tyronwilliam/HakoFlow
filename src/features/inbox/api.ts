import { ConversationListItem } from "./adapters";

export const API_INBOX = {
  GET: (startIndex: number, stopIndex: number) =>
    `/api/conversations?startIndex=${startIndex}&stopIndex=${stopIndex}`,
  GET_ONE: (conversationId: ConversationListItem["id"]) => `/api/conversations/${conversationId}`,
  UPDATE: (conversationId: ConversationListItem["id"]) => `/api/conversations/${conversationId}`,
  LIST_UNLINKED: () => "/api/conversations/unlinked",
} as const;
