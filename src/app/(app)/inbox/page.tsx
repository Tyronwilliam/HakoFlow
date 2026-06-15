import { ConversationList } from "@/features/inbox/components/conversation-list";

export default function InboxPage() {
  return (
    <section className="border-border bg-background flex h-full w-95 shrink-0 flex-col overflow-hidden border-r">
      <ConversationList />
    </section>
  );
}
