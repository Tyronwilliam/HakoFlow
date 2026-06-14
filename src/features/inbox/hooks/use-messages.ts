"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageRow } from "@/types";

export function useMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async (): Promise<MessageRow[]> => {
      const response = await fetch("/api/messages");
      const data = await response.json();

      return data.messages;
    },
  });
}
