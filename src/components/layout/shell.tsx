import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex h-screen flex-col">
      <section className="flex h-full">
        <Sidebar />
        <section className="flex w-full flex-col">
          <Topbar />
          <div className="border-border border-b px-3 py-2">FILTRE</div>
          <main className="flex min-h-0 flex-1">{children}</main>
        </section>
      </section>
    </section>
  );
}
