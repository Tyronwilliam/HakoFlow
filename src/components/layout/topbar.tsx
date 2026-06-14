import { ThemeToggle } from "@/components/shared/theme-toggle";

export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <span className="text-sm font-medium">HakoFlow</span>
      <ThemeToggle />
    </header>
  );
}
