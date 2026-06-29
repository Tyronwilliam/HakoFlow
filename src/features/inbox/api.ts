import { ConversationListItem } from "./adapters";

export const API_INBOX = {
  GET: (startIndex: number, stopIndex: number) =>
    `/api/conversations?startIndex=${startIndex}&stopIndex=${stopIndex}`,
  UPDATE: (conversationId: ConversationListItem["id"]) => `/api/conversations/${conversationId}`,
} as const;
