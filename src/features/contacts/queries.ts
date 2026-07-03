import { fetchApi } from "@/lib/api";
import { API_CONTACTS } from "./api";
import type { Contact } from "./adapters";

export interface ContactsApiResponse {
  contacts: Contact[];
}

export const contactsQueryKey = () => ["contacts"] as const;

export const contactsQueryOptions = () => ({
  queryKey: contactsQueryKey(),
  queryFn: () => fetchApi<ContactsApiResponse>(API_CONTACTS.LIST()),
});
