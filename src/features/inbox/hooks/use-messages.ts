"use client";

import { useQuery } from "@tanstack/react-query";
import type { Message } from "@/features/inbox/types";

export function useMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async (): Promise<Message[]> => {
      const response = await fetch("/api/messages");
      const data = await response.json();

      return data.messages;
    },
  });
}
