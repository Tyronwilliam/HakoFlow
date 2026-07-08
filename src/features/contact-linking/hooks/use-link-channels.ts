"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { linkableContactsQueryKey, linkChannelsMutation } from "@/features/contact-linking/queries";

export function useLinkChannels() {
  const queryClient = useQueryClient();

  return useMutation({
    ...linkChannelsMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkableContactsQueryKey() });
    },
  });
}
