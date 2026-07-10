import Link from "next/link";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactList } from "@/features/contacts/components/contact-list";

export default function ContactsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <Button variant="outline" size="sm" render={<Link href="/contacts/gestion" />}>
          <Link2 />
          Gestion des contacts
        </Button>
      </div>
      <ContactList />
    </div>
  );
}
