"use client";

import { useQuery } from "@tanstack/react-query";
import type { Contact } from "@/features/contacts/types";

export function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async (): Promise<Contact[]> => {
      const response = await fetch("/api/contacts");
      const data = await response.json();

      return data.contacts;
    },
  });
}
