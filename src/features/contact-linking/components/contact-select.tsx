import { Label } from "@/components/ui/label";

const selectClassName =
  "border-input h-8 w-full rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

interface ContactSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  contacts: { id: string; name: string }[];
}

export function ContactSelect({ id, label, value, onChange, contacts }: ContactSelectProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className={selectClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Sélectionner un contact…</option>
        {contacts.map((contact) => (
          <option key={contact.id} value={contact.id}>
            {contact.name}
          </option>
        ))}
      </select>
    </div>
  );
}
