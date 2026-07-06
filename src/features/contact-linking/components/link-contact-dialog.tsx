"use client";

import { useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLinkableContacts } from "@/features/contact-linking/hooks/use-linkable-contacts";
import { useLinkChannels } from "@/features/contact-linking/hooks/use-link-channels";

const selectClassName =
  "border-input h-8 w-full rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function LinkContactDialog() {
  const [open, setOpen] = useState(false);
  const [sourceContactId, setSourceContactId] = useState("");
  const [targetContactId, setTargetContactId] = useState("");
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);

  const contacts = useLinkableContacts();
  const linkChannels = useLinkChannels();

  const sourceContact = useMemo(
    () => contacts.data?.find((contact) => contact.id === sourceContactId),
    [contacts.data, sourceContactId],
  );

  function toggleChannel(channelId: string) {
    setSelectedChannelIds((current) =>
      current.includes(channelId)
        ? current.filter((id) => id !== channelId)
        : [...current, channelId],
    );
  }

  function reset() {
    setSourceContactId("");
    setTargetContactId("");
    setSelectedChannelIds([]);
  }

  function handleSubmit() {
    linkChannels.mutate(
      { contactChannelIds: selectedChannelIds, targetContactId },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      },
    );
  }

  const canSubmit =
    sourceContactId &&
    targetContactId &&
    sourceContactId !== targetContactId &&
    selectedChannelIds.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Link2 />
        <span className="sr-only">Associer un contact</span>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Associer un contact</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="source-contact">Contact source</Label>
            <select
              id="source-contact"
              className={selectClassName}
              value={sourceContactId}
              onChange={(event) => {
                setSourceContactId(event.target.value);
                setSelectedChannelIds([]);
              }}
            >
              <option value="">Sélectionner un contact…</option>
              {contacts.data?.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </div>

          {sourceContact && sourceContact.channels.length > 0 && (
            <div className="space-y-1.5">
              <Label>Canaux à rattacher</Label>
              <div className="space-y-2">
                {sourceContact.channels.map((channel) => (
                  <label key={channel.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedChannelIds.includes(channel.id)}
                      onChange={() => toggleChannel(channel.id)}
                    />
                    {channel.provider} — {channel.displayHandle ?? channel.externalId}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="target-contact">Associer au contact</Label>
            <select
              id="target-contact"
              className={selectClassName}
              value={targetContactId}
              onChange={(event) => setTargetContactId(event.target.value)}
            >
              <option value="">Sélectionner un contact…</option>
              {contacts.data
                ?.filter((contact) => contact.id !== sourceContactId)
                .map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button disabled={!canSubmit || linkChannels.isPending} onClick={handleSubmit}>
            {linkChannels.isPending ? "Association…" : "Associer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
