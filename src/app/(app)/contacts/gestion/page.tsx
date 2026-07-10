import { Link2 } from "lucide-react";
import { ContactManagementTabs } from "@/features/contact-linking/components/contact-management-tabs";

export default function ContactManagementPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Link2 className="size-4.5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">Gestion des contacts</h1>
          <p className="text-muted-foreground text-sm">
            Associations manuelles et fusions suggérées par le système
          </p>
        </div>
      </header>
      <ContactManagementTabs />
    </div>
  );
}
