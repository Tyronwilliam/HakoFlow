"use client";

import { useMemo, useState } from "react";
import { LinkableContact } from "@/features/contact-linking/adapters";
import { useLinkChannels } from "@/features/contact-linking/hooks/use-link-channels";

export function useLinkContactForm({
  contacts,
  onSuccess,
}: {
  contacts: LinkableContact[];
  onSuccess: () => void;
}) {
  const [sourceContactId, setSourceContactId] = useState("");
  const [targetContactId, setTargetContactId] = useState("");
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);

  const linkChannels = useLinkChannels();

  const sourceContact = useMemo(
    () => contacts.find((contact) => contact.id === sourceContactId),
    [contacts, sourceContactId],
  );

  const targetContacts = useMemo(
    () => contacts.filter((contact) => contact.id !== sourceContactId),
    [contacts, sourceContactId],
  );

  function selectSourceContact(contactId: string) {
    setSourceContactId(contactId);
    setSelectedChannelIds([]);
  }

  function toggleChannel(channelId: string) {
    setSelectedChannelIds((current) =>
      current.includes(channelId)
        ? current.filter((id) => id !== channelId)
        : [...current, channelId],
    );
  }

  const canSubmit = Boolean(
    sourceContactId &&
    targetContactId &&
    sourceContactId !== targetContactId &&
    selectedChannelIds.length > 0,
  );

  function submit() {
    linkChannels.mutate({ contactChannelIds: selectedChannelIds, targetContactId }, { onSuccess });
  }

  return {
    sourceContactId,
    selectSourceContact,
    targetContactId,
    setTargetContactId,
    selectedChannelIds,
    toggleChannel,
    sourceContact,
    targetContacts,
    canSubmit,
    isPending: linkChannels.isPending,
    submit,
  };
}
