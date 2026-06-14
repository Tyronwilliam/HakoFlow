import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <section className="flex w-full flex-col">
          <Topbar />
          <div className="border-border bg-background border-b px-3 py-2"></div>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </section>
      </div>
    </div>
  );
}
