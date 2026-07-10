export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full">
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
