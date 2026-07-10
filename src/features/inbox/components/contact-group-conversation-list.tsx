"use client";
import { CollapsibleContent } from "@/components/ui/collapsible";
import type { ContactConversationGroup } from "@/features/inbox/adapters";
import { ConversationListItem } from "@/features/inbox/components/conversation-list-item";

interface ContactGroupConversationListProps {
  conversations: ContactConversationGroup["conversations"];
}

export function ContactGroupConversationList({ conversations }: ContactGroupConversationListProps) {
  const conversationsByRecency = [...conversations].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <CollapsibleContent
      render={<ul className="border-border ml-9.5 flex flex-col gap-0.5 divide-y border-l pb-1" />}
    >
      {conversationsByRecency.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          showContact={false}
        />
      ))}
    </CollapsibleContent>
  );
}
