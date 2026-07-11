"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  contactLinkHistoryQueryKey,
  linkableContactsQueryKey,
  linkChannelsMutation,
} from "@/features/contact-linking/queries";
import { conversationsQueryKey } from "@/features/inbox/queries";

export function useLinkChannels() {
  const queryClient = useQueryClient();

  return useMutation({
    ...linkChannelsMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkableContactsQueryKey() });
      queryClient.invalidateQueries({ queryKey: contactLinkHistoryQueryKey() });
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: conversationsQueryKey() });
    },
  });
}
