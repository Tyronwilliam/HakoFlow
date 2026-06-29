"use client";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { Paragraph } from "@/components/shared/Text/Paragraph";
import { ConversationListItem as ConversationListItemType } from "@/features/inbox/adapters";
import { formatDate } from "@/lib/date";
import { useParams, useRouter } from "next/navigation";
import { useUpdateConversation } from "../hooks/use-conversations";

interface ConversationListItemProps {
  conversation: ConversationListItemType;
}

export function ConversationListItem({ conversation }: ConversationListItemProps) {
  const router = useRouter();
  const params = useParams();
  const { mutate: updateConversation } = useUpdateConversation();
  const isUnread = conversation.unreadCount > 0;

  const resetUnreadCount = () => {
    if (conversation.unreadCount > 0) {
      updateConversation({ id: conversation.id });
    }
  };
  const openThread = () => {
    resetUnreadCount();
    router.push(`/inbox/${conversation.id}`);
  };
  //
  return (
    <li className="hover:bg-secondary/40 relative flex w-full items-center gap-3 text-left transition-colors">
      {params.id === conversation.id && (
        <span className="bg-primary absolute inset-y-0 left-0 w-0.5"></span>
      )}
      <button
        className="flex w-full cursor-pointer flex-col gap-1 px-4 py-3 text-left"
        onClick={openThread}
        aria-label="open-conversation"
      >
        {isUnread && (
          <span className="absolute top-1/2 right-4 h-2 w-2 -translate-y-1/2 rounded-full bg-red-700"></span>
        )}

        <div className="flex items-center justify-between">
          <Paragraph type="regular" className={isUnread ? "font-semibold" : "text-foreground/90"}>
            {conversation.contactName}
          </Paragraph>
          <span className="text-muted-foreground ml-auto shrink-0 text-[11px]">
            {formatDate(conversation.lastMessageAt)}
          </span>
        </div>
        {conversation.contactHandle && (
          <span className="mt-0.5 flex items-center gap-2 text-[12px]">
            <ChannelBadge channel={conversation.channel} />
            <span className="text-muted-foreground/80 truncate text-[12px]">
              {conversation.contactHandle}
            </span>
          </span>
        )}
        <Paragraph type="light">{conversation.lastMessagePreview}</Paragraph>
      </button>
    </li>
  );
}
