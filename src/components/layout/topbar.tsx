import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MergeSuggestionsTrigger } from "@/features/contact-linking/components/merge-suggestions-trigger";
import { LinkContactDialog } from "@/features/contact-linking/components/link-contact-dialog";

export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <span className="text-sm font-medium">HakoFlow</span>
      <div className="flex items-center gap-2">
        <LinkContactDialog />
        <MergeSuggestionsTrigger />
        <ThemeToggle />
      </div>
    </header>
  );
}
