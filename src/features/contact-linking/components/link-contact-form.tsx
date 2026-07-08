"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { LinkableContact } from "@/features/contact-linking/adapters";
import { ContactSelect } from "@/features/contact-linking/components/contact-select";
import { ChannelCheckboxList } from "@/features/contact-linking/components/channel-checkbox-list";
import { useLinkContactForm } from "@/features/contact-linking/hooks/use-link-contact-form";

interface LinkContactFormProps {
  contacts: LinkableContact[];
  onSuccess: () => void;
}

export function LinkContactForm({ contacts, onSuccess }: LinkContactFormProps) {
  const form = useLinkContactForm({ contacts, onSuccess });

  return (
    <>
      <div className="space-y-4">
        <ContactSelect
          id="source-contact"
          label="Contact source"
          value={form.sourceContactId}
          onChange={form.selectSourceContact}
          contacts={contacts}
        />

        {form.sourceContact && form.sourceContact.channels.length > 0 && (
          <ChannelCheckboxList
            channels={form.sourceContact.channels}
            selectedIds={form.selectedChannelIds}
            onToggle={form.toggleChannel}
          />
        )}

        <ContactSelect
          id="target-contact"
          label="Associer au contact"
          value={form.targetContactId}
          onChange={form.setTargetContactId}
          contacts={form.targetContacts}
        />
      </div>

      <DialogFooter>
        <Button disabled={!form.canSubmit || form.isPending} onClick={form.submit}>
          {form.isPending ? "Association…" : "Associer"}
        </Button>
      </DialogFooter>
    </>
  );
}
