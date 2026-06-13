import { MessageList } from "@/features/inbox/components/message-list";

export default function InboxPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <MessageList />
    </div>
  );
}
