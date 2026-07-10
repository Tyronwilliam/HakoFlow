"use client";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { Paragraph } from "@/components/shared/Text/Paragraph";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConversationListItem as ConversationListItemType } from "@/features/inbox/adapters";
import { getInitials } from "@/lib/initials";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useUpdateConversation } from "../hooks/use-conversations";

interface ConversationListItemProps {
  conversation: ConversationListItemType;
  showContact?: boolean;
}

export function ConversationListItem({
  conversation,
  showContact = true,
}: ConversationListItemProps) {
  const router = useRouter();
  const params = useParams();
  const { mutate: updateConversation } = useUpdateConversation();
  const isUnread = conversation.unreadCount > 0;
  const isActive = params.id === conversation.id;

  const resetUnreadCount = () => {
    if (conversation.unreadCount > 0) {
      updateConversation({ id: conversation.id });
    }
  };
  const openThread = () => {
    resetUnreadCount();
    router.push(`/inbox/${conversation.id}`);
  };

  return (
    <li
      className={cn(
        "hover:bg-accent hover:text-accent-foreground relative flex w-full items-center gap-3 text-left transition-colors",
        isActive && "bg-accent text-accent-foreground",
      )}
    >
      {isActive && <span className="bg-primary absolute inset-y-0 left-0 w-0.5"></span>}
      <button
        className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left"
        onClick={openThread}
        aria-label="open-conversation"
      >
        <span className="flex w-1.5 shrink-0 items-center justify-center self-center">
          {isUnread && <span className="bg-unread h-1.5 w-1.5 rounded-full" />}
        </span>
        {showContact && (
          <Avatar size="sm" className="mt-0.5">
            <AvatarFallback>{getInitials(conversation.contactName)}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            {showContact ? (
              <Paragraph
                type="regular"
                className={isUnread ? "font-semibold" : "text-foreground/90"}
              >
                {conversation.contactName}
              </Paragraph>
            ) : (
              <span className="flex min-w-0 items-center gap-2 text-[12px]">
                <ChannelBadge channel={conversation.channel} />
                {conversation.contactHandle && (
                  <span className="text-muted-foreground/80 truncate text-[12px]">
                    {conversation.contactHandle}
                  </span>
                )}
              </span>
            )}
            <span className="text-muted-foreground ml-auto shrink-0 text-[11px]">
              {formatDate(conversation.lastMessageAt)}
            </span>
            {isUnread && (
              <span className="bg-unread text-unread-foreground flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          {showContact && (
            <span className="mt-0.5 flex items-center gap-2 text-[12px]">
              <ChannelBadge channel={conversation.channel} />
              {conversation.contactHandle && (
                <span className="text-muted-foreground/80 truncate text-[12px]">
                  {conversation.contactHandle}
                </span>
              )}
            </span>
          )}
          <Paragraph type="light">{conversation.lastMessagePreview}</Paragraph>
        </div>
      </button>
    </li>
  );
}
