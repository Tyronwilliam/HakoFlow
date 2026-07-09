"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { Paragraph } from "@/components/shared/Text/Paragraph";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "@/components/ui/collapsible";
import { formatDate } from "@/lib/date";
import { getInitials } from "@/lib/initials";
import { cn } from "@/lib/utils";
import type { ContactConversationGroup } from "@/features/inbox/adapters";
import { ConversationListItem } from "@/features/inbox/components/conversation-list-item";

interface ContactGroupListItemProps {
  group: ContactConversationGroup;
}

export function ContactGroupListItem({ group }: ContactGroupListItemProps) {
  const params = useParams();
  const containsActiveConversation = group.conversations.some(
    (conversation) => conversation.id === params.id,
  );
  const [open, setOpen] = useState(containsActiveConversation);
  const [trackedActive, setTrackedActive] = useState(containsActiveConversation);
  if (containsActiveConversation !== trackedActive) {
    setTrackedActive(containsActiveConversation);
    if (containsActiveConversation) setOpen(true);
  }

  if (group.conversations.length === 1) {
    return <ConversationListItem conversation={group.conversations[0]} />;
  }

  const isUnread = group.unreadConversationsCount > 0;
  const unreadLabel = `${group.unreadConversationsCount} conversation${group.unreadConversationsCount > 1 ? "s" : ""} non lue${group.unreadConversationsCount > 1 ? "s" : ""}`;
  const conversationsByRecency = [...group.conversations].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <Collapsible render={<li className="relative" />} open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className="hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors"
        aria-label="toggle-contact-conversations"
      >
        <ChevronDown
          className={cn(
            "text-muted-foreground mt-1 h-3.5 w-3.5 shrink-0 transition-transform",
            !open && "-rotate-90",
          )}
        />
        <Avatar size="sm" className="mt-0.5">
          <AvatarFallback>{getInitials(group.contactName)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Paragraph type="regular" className={isUnread ? "font-semibold" : "text-foreground/90"}>
              {group.contactName}
            </Paragraph>
            <span
              className={cn(
                "bg-secondary text-secondary-foreground flex h-[18px] min-w-[19px] shrink-0 items-center justify-center rounded-full px-1 text-[11px] font-semibold",
                isUnread && "text-unread",
              )}
            >
              {group.conversations.length}
            </span>
            <span className="text-muted-foreground ml-auto shrink-0 text-[11px]">
              {formatDate(group.lastMessageAt)}
            </span>
          </div>
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {group.channels.map((channel) => (
              <ChannelBadge key={channel} channel={channel} />
            ))}
          </span>

          {isUnread && (
            <span className="text-unread mt-0.5 text-[11px] font-semibold">{unreadLabel}</span>
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsiblePanel
        render={
          <ul className="border-border ml-[38px] flex flex-col gap-0.5 divide-y border-l pb-1" />
        }
      >
        {conversationsByRecency.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            showContact={false}
          />
        ))}
      </CollapsiblePanel>
    </Collapsible>
  );
}
