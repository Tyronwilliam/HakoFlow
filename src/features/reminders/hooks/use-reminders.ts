"use client";

import { useQuery } from "@tanstack/react-query";
import type { Reminder } from "@/features/reminders/types";

export function useReminders() {
  return useQuery({
    queryKey: ["reminders"],
    queryFn: async (): Promise<Reminder[]> => {
      const response = await fetch("/api/reminders");
      const data = await response.json();

      return data.reminders;
    },
  });
}
