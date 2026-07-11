import { API_CONTACT_LINKING } from "@/features/contact-linking/api";
import {
  RawContactLinkHistoryRow,
  RawContactMergeRow,
  RawLinkableContactRow,
  RawMergeSuggestionRow,
  toContactLinkHistory,
  toContactMerge,
  toLinkableContact,
  toMergeSuggestion,
} from "@/features/contact-linking/adapters";
import { fetchApi } from "@/lib/api";

type MergeSuggestionsApiResponse = {
  suggestions: RawMergeSuggestionRow[];
};

type LinkableContactsApiResponse = {
  contacts: RawLinkableContactRow[];
};

type ContactMergesApiResponse = {
  merges: RawContactMergeRow[];
};

type ContactLinkHistoryApiResponse = {
  history: RawContactLinkHistoryRow[];
};

export const mergeSuggestionsQueryKey = () => ["merge-suggestions"] as const;

export const mergeSuggestionsQueryOptions = () => ({
  queryKey: mergeSuggestionsQueryKey(),
  queryFn: async () => {
    const data = await fetchApi<MergeSuggestionsApiResponse>(
      API_CONTACT_LINKING.LIST_SUGGESTIONS(),
    );

    return data.suggestions.map(toMergeSuggestion);
  },
});

export const ignoreMergeSuggestionMutation = () => ({
  mutationFn: async (suggestionId: string) => {
    return fetchApi(API_CONTACT_LINKING.IGNORE_SUGGESTION(suggestionId), {
      method: "PATCH",
      body: JSON.stringify({ action: "ignore" }),
    });
  },
});

export const mergeSuggestionMutation = () => ({
  mutationFn: async ({
    suggestionId,
    keepContactId,
  }: {
    suggestionId: string;
    keepContactId: string;
  }) => {
    return fetchApi(API_CONTACT_LINKING.MERGE_SUGGESTION(suggestionId), {
      method: "PATCH",
      body: JSON.stringify({ action: "merge", keepContactId }),
    });
  },
});

export const linkableContactsQueryKey = () => ["contact-linking", "contacts"] as const;

export const linkableContactsQueryOptions = () => ({
  queryKey: linkableContactsQueryKey(),
  queryFn: async () => {
    const data = await fetchApi<LinkableContactsApiResponse>(
      API_CONTACT_LINKING.LIST_LINKABLE_CONTACTS(),
    );

    return data.contacts.map(toLinkableContact);
  },
});

export const linkChannelsMutation = () => ({
  mutationFn: async ({
    contactChannelIds,
    targetContactId,
  }: {
    contactChannelIds: string[];
    targetContactId: string;
  }) => {
    return fetchApi(API_CONTACT_LINKING.LINK_CHANNELS(), {
      method: "POST",
      body: JSON.stringify({ contactChannelIds, targetContactId }),
    });
  },
});

export const contactMergesQueryKey = () => ["contact-merges"] as const;

export const contactMergesQueryOptions = () => ({
  queryKey: contactMergesQueryKey(),
  queryFn: async () => {
    const data = await fetchApi<ContactMergesApiResponse>(
      API_CONTACT_LINKING.LIST_CONTACT_MERGES(),
    );

    return data.merges.map(toContactMerge);
  },
});

export const contactLinkHistoryQueryKey = () => ["contact-linking", "history"] as const;

export const contactLinkHistoryQueryOptions = () => ({
  queryKey: contactLinkHistoryQueryKey(),
  queryFn: async () => {
    const data = await fetchApi<ContactLinkHistoryApiResponse>(
      API_CONTACT_LINKING.LIST_CONTACT_LINK_HISTORY(),
    );

    return data.history.map(toContactLinkHistory);
  },
});
