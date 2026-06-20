import { Message } from "./adapters";

export const API_MESSAGES = {
  GET: (id: Message["conversationId"], startIndex: number, stopIndex: number) =>
    `/api/messages/${id}?startIndex=${startIndex}&stopIndex=${stopIndex}`,
};
