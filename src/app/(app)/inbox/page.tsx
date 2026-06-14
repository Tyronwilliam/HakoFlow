import { ConversationList } from "@/features/inbox/components/conversation-list";

export default function InboxPage() {
  return (
    <section className="border-border bg-background flex w-95 shrink-0 flex-col border-r">
      <section className="min-h-0 flex-1 overflow-y-auto">
        <ConversationList />
      </section>
    </section>
  );
}
