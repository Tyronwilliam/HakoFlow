"use client";

import { useContacts } from "@/features/contacts/hooks/use-contacts";
import { UserAvatar } from "@/components/shared/avatar";
import { EmptyState } from "@/components/shared/empty-state";

export function ContactList() {
  const { data: contacts = [] } = useContacts();

  if (contacts.length === 0) {
    return <EmptyState title="No contacts" description="Contacts will appear here." />;
  }

  return (
    <ul className="divide-y">
      {contacts.map((contact) => (
        <li key={contact.id} className="flex items-center gap-3 py-3">
          <UserAvatar name={contact.name} src={contact.avatarUrl} />
          <div>
            <p className="text-sm font-medium">{contact.name}</p>
            {contact.email && <p className="text-muted-foreground text-sm">{contact.email}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
