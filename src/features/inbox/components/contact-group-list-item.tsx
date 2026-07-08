"use client";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { Paragraph } from "@/components/shared/Text/Paragraph";
import { formatDate } from "@/lib/date";
import type { ContactConversationGroup } from "@/features/inbox/adapters";
import { ConversationListItem } from "@/features/inbox/components/conversation-list-item";

interface ContactGroupListItemProps {
  group: ContactConversationGroup;
  onOpen: () => void;
}

export function ContactGroupListItem({ group, onOpen }: ContactGroupListItemProps) {
  if (group.conversations.length === 1) {
    return <ConversationListItem conversation={group.conversations[0]} />;
  }

  const isUnread = group.unreadConversationsCount > 0;
  const unreadLabel = `${group.unreadConversationsCount} conversation${group.unreadConversationsCount > 1 ? "s" : ""} non lue${group.unreadConversationsCount > 1 ? "s" : ""}`;

  return (
    <li className="relative">
      <button
        className="hover:bg-secondary/40 flex w-full cursor-pointer flex-col gap-1 px-4 py-3 text-left transition-colors"
        onClick={onOpen}
        aria-label="open-contact-conversations"
      >
        <div className="flex items-center justify-between">
          <Paragraph type="regular" className={isUnread ? "font-semibold" : "text-foreground/90"}>
            {group.contactName}
          </Paragraph>
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
          <span className="mt-0.5 text-[11px] font-semibold text-red-700">{unreadLabel}</span>
        )}
      </button>
    </li>
  );
}
