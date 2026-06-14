import { ConversationList } from "@/features/inbox/components/conversation-list";

export default function InboxPage() {
  return (
    <div className="flex min-h-0 flex-1">
      <section className="border-border bg-background flex h-screen w-95 shrink-0 flex-col overflow-y-auto border-r">
        <ConversationList />
      </section>
    </div>
  );
}
