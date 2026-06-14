import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex h-full">
        <Sidebar />
        <section className="flex w-full flex-col">
          <Topbar />
          <div className="border-border bg-background border-b px-3 py-2">FILTRE</div>
          <main className="flex-1 overflow-hidden">{children}</main>
        </section>
      </div>
    </div>
  );
}
