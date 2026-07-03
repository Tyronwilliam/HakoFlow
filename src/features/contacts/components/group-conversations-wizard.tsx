"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CHANNELS_LIST } from "@/lib/constant/channels";
import type { ChannelListType } from "@/types";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useContacts } from "@/features/contacts/hooks/use-contacts";
import { useUnlinkedConversations } from "@/features/inbox/hooks/use-unlinked-conversations";
import {
  conversationsQueryKey,
  unlinkedConversationsQueryKey,
  conversationDetailQueryKey,
} from "@/features/inbox/queries";
import { contactsQueryKey } from "@/features/contacts/queries";
import {
  groupConversationsUnderContact,
  type GroupConversationsState,
} from "@/features/contacts/actions/group-conversations";

const NEW_CONTACT_VALUE = "";
const NO_SELECTION_VALUE = "";

const selectClassName = cn(
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:ring-3",
);

interface GroupConversationsWizardProps {
  conversationId: string;
  currentProvider: ChannelListType;
  currentExternalId: string | null;
  currentDisplayHandle: string | null;
  onOpenChange: (open: boolean) => void;
}

export function GroupConversationsWizard({
  conversationId,
  currentProvider,
  currentExternalId,
  currentDisplayHandle,
  onOpenChange,
}: GroupConversationsWizardProps) {
  const queryClient = useQueryClient();
  const contacts = useContacts();
  const unlinkedConversations = useUnlinkedConversations();

  const [targetContactId, setTargetContactId] = useState<string>(NEW_CONTACT_VALUE);
  const [newContactName, setNewContactName] = useState("");
  const [selections, setSelections] = useState<Record<ChannelListType, string>>(() => {
    const initial = {} as Record<ChannelListType, string>;
    for (const provider of Object.keys(CHANNELS_LIST) as ChannelListType[]) {
      initial[provider] = provider === currentProvider ? conversationId : NO_SELECTION_VALUE;
    }
    return initial;
  });

  const optionsByProvider = useMemo(() => {
    const grouped = {} as Record<
      ChannelListType,
      { id: string; externalId: string; displayHandle: string | null }[]
    >;
    for (const provider of Object.keys(CHANNELS_LIST) as ChannelListType[]) {
      grouped[provider] = (unlinkedConversations.data ?? []).filter(
        (conversation) => conversation.provider === provider,
      );
    }

    const hasCurrentConversation = grouped[currentProvider].some(
      (option) => option.id === conversationId,
    );
    if (!hasCurrentConversation) {
      grouped[currentProvider] = [
        {
          id: conversationId,
          externalId: currentExternalId ?? "Conversation actuelle",
          displayHandle: currentDisplayHandle,
        },
        ...grouped[currentProvider],
      ];
    }

    return grouped;
  }, [
    unlinkedConversations.data,
    currentProvider,
    currentExternalId,
    currentDisplayHandle,
    conversationId,
  ]);

  const [state, formAction, isPending] = useActionState<GroupConversationsState, FormData>(
    groupConversationsUnderContact,
    {},
  );

  useEffect(() => {
    if (!state.success) return;

    queryClient.invalidateQueries({ queryKey: conversationsQueryKey() });
    queryClient.invalidateQueries({ queryKey: contactsQueryKey() });
    queryClient.invalidateQueries({ queryKey: unlinkedConversationsQueryKey() });
    queryClient.invalidateQueries({ queryKey: conversationDetailQueryKey(conversationId) });
    onOpenChange(false);
  }, [state.success, queryClient, conversationId, onOpenChange]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>Regrouper sous un contact</DialogTitle>
        <DialogDescription>
          Choisissez un contact cible, puis rattachez au plus une conversation non liée par canal.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="targetContactId">Contact cible</Label>
        <select
          id="targetContactId"
          name="targetContactId"
          className={selectClassName}
          value={targetContactId}
          onChange={(event) => setTargetContactId(event.target.value)}
        >
          <option value={NEW_CONTACT_VALUE}>+ Nouveau contact</option>
          {(contacts.data ?? []).map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name}
            </option>
          ))}
        </select>
      </div>

      {targetContactId === NEW_CONTACT_VALUE && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newContactName">Nom du nouveau contact</Label>
          <Input
            id="newContactName"
            name="newContactName"
            value={newContactName}
            onChange={(event) => setNewContactName(event.target.value)}
            placeholder="ex: Marie Dupont"
          />
        </div>
      )}

      {(Object.keys(CHANNELS_LIST) as ChannelListType[]).map((provider) => (
        <div key={provider} className="flex flex-col gap-1.5">
          <Label htmlFor={`selection-${provider}`}>{CHANNELS_LIST[provider]}</Label>
          <select
            id={`selection-${provider}`}
            className={selectClassName}
            value={selections[provider]}
            onChange={(event) =>
              setSelections((prev) => ({ ...prev, [provider]: event.target.value }))
            }
          >
            <option value={NO_SELECTION_VALUE}>Aucune</option>
            {optionsByProvider[provider].map((option) => (
              <option key={option.id} value={option.id}>
                {option.displayHandle ?? option.externalId}
              </option>
            ))}
          </select>
        </div>
      ))}

      {(Object.keys(CHANNELS_LIST) as ChannelListType[])
        .filter((provider) => selections[provider] !== NO_SELECTION_VALUE)
        .map((provider) => (
          <input key={provider} type="hidden" name="conversationIds" value={selections[provider]} />
        ))}

      {state.error && <p className="text-destructive text-sm">{state.error}</p>}

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Regroupement..." : "Regrouper"}
        </Button>
      </DialogFooter>
    </form>
  );
}
