"use client";

// import { useMessages } from "@/features/inbox/hooks/use-messages";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { EmptyState } from "@/components/shared/empty-state";
import data from "@/mocks/data/supabase-messages.json";
import { MessageRow } from "@/types";
export function MessageList() {
  // const { data: messages = [] } = useMessages();
  const messages = data as MessageRow[];
  if (messages.length === 0) {
    return <EmptyState title="No messages" description="Your inbox is empty for now." />;
  }

  return (
    <ul className="divide-y">
      {messages.map((message) => (
        <li key={message.id} className="flex items-center gap-3 py-3">
          <ChannelBadge channel={message.channel} />
          <div>
            <p className="text-muted-foreground text-sm">{message.content}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
