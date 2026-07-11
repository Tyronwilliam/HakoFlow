"use client";

import { useActionState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { undoLink, UndoLinkState } from "@/features/contact-linking/actions/undo-link";
import {
  contactLinkHistoryQueryKey,
  linkableContactsQueryKey,
} from "@/features/contact-linking/queries";
import { conversationsQueryKey } from "@/features/inbox/queries";

const initialState: UndoLinkState = {};

export function useUndoLink() {
  const queryClient = useQueryClient();
  const [state, action, isPending] = useActionState(undoLink, initialState);

  useEffect(() => {
    if (!state.restoredContactId) return;

    queryClient.invalidateQueries({ queryKey: contactLinkHistoryQueryKey() });
    queryClient.invalidateQueries({ queryKey: linkableContactsQueryKey() });
    queryClient.invalidateQueries({ queryKey: ["contacts"] });
    queryClient.invalidateQueries({ queryKey: conversationsQueryKey() });
  }, [state, queryClient]);

  return { state, action, isPending };
}
