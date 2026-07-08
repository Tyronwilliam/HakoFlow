export const API_CONTACT_LINKING = {
  LIST_SUGGESTIONS: () => `/api/merge-suggestions`,
  IGNORE_SUGGESTION: (id: string) => `/api/merge-suggestions/${id}`,
  MERGE_SUGGESTION: (id: string) => `/api/merge-suggestions/${id}`,
  LIST_LINKABLE_CONTACTS: () => `/api/contact-linking/contacts`,
  LINK_CHANNELS: () => `/api/contact-linking/link`,
} as const;
