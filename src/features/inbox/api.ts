export const inboxApi = {
  conversations: (startIndex: number, stopIndex: number) =>
    `/api/conversations?startIndex=${startIndex}&stopIndex=${stopIndex}`,
} as const;
