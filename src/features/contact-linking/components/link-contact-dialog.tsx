"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QueryBoundary } from "@/components/shared/Boundaries/query-boundary";
import { LinkContactForm } from "@/features/contact-linking/components/link-contact-form";
import { useLinkableContacts } from "@/features/contact-linking/hooks/use-linkable-contacts";

export function LinkContactDialog() {
  const [open, setOpen] = useState(false);
  const contacts = useLinkableContacts();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Link2 />
        <span className="sr-only">Associer un contact</span>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Associer un contact</DialogTitle>
        </DialogHeader>

        <QueryBoundary
          isLoading={contacts.isLoading}
          isEmpty={(contacts.data ?? []).length === 0}
          scope="contacts"
          error={contacts.error}
          emptyTitle="Aucun contact"
          emptyDescription="Il n'y a pas encore de contacts à associer."
        >
          <LinkContactForm contacts={contacts.data ?? []} onSuccess={() => setOpen(false)} />
        </QueryBoundary>
      </DialogContent>
    </Dialog>
  );
}
