"use client";

import { useActionState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { undoMerge, UndoMergeState } from "@/features/contact-linking/actions/undo-merge";
import {
  contactMergesQueryKey,
  linkableContactsQueryKey,
} from "@/features/contact-linking/queries";
import { conversationsQueryKey } from "@/features/inbox/queries";

const initialState: UndoMergeState = {};

export function useUndoMerge() {
  const queryClient = useQueryClient();
  const [state, action, isPending] = useActionState(undoMerge, initialState);

  useEffect(() => {
    if (!state.restoredContactId) return;

    queryClient.invalidateQueries({ queryKey: contactMergesQueryKey() });
    queryClient.invalidateQueries({ queryKey: linkableContactsQueryKey() });
    queryClient.invalidateQueries({ queryKey: ["contacts"] });
    queryClient.invalidateQueries({ queryKey: conversationsQueryKey() });
  }, [state, queryClient]);

  return { state, action, isPending };
}
