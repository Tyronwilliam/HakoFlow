import { ConversationList } from "@/features/inbox/components/conversation-list";

export default function InboxPage() {
  return (
    <section className="border-border bg-background flex h-screen w-95 shrink-0 flex-col overflow-y-auto border-r">
      <section className="flex-1 overflow-y-auto">
        <ConversationList />
      </section>
    </section>
  );
}
