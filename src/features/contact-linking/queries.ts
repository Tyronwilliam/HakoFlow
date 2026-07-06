import { API_CONTACT_LINKING } from "@/features/contact-linking/api";
import {
  RawLinkableContactRow,
  RawMergeSuggestionRow,
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
