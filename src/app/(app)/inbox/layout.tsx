import { ConversationList } from "../../../features/inbox/components/conversation-list";

export default function InboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full">
      <ConversationList />
      <main className="flex-1">{children}</main>
    </div>
  );
}
