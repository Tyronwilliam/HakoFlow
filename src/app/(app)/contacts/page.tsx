import { ContactList } from "@/features/contacts/components/contact-list";

export default function ContactsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Contacts</h1>
      <ContactList />
    </div>
  );
}
