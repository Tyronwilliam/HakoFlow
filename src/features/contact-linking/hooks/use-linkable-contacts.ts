"use client";

import { useQuery } from "@tanstack/react-query";
import { linkableContactsQueryOptions } from "@/features/contact-linking/queries";

export function useLinkableContacts() {
  return useQuery(linkableContactsQueryOptions());
}
