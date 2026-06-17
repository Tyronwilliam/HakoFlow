import { ConversationListItem as ConversationListItemType } from "@/features/inbox/adapters";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { GraySpan } from "@/components/shared/Text/GraySpan";
import { PreviewText } from "@/components/shared/Text/PreviewText";
import { Name } from "@/components/shared/Text/Name";
import { formatDate } from "@/lib/date";
import { useUpdateConversation } from "../hooks/use-conversations";

interface ConversationListItemProps {
  conversation: ConversationListItemType;
}

export function ConversationListItem({ conversation }: ConversationListItemProps) {
  const isUnread = conversation.unreadCount > 0;
  const { mutate: updateConversation } = useUpdateConversation();

  const resetUnreadCount = () => {
    if (conversation.unreadCount > 0) {
      updateConversation({ id: conversation.id });
    }
  };
  return (
    <li className="hover:bg-secondary/40 relative flex w-full items-center gap-3 text-left transition-colors">
      <button
        className="flex w-full cursor-pointer flex-col gap-1 px-4 py-3 text-left"
        onClick={resetUnreadCount}
        aria-label="open-conversation"
      >
        {isUnread && (
          <span className="absolute top-1/2 right-4 h-2 w-2 -translate-y-1/2 rounded-full bg-red-700"></span>
        )}

        <div className="flex items-center justify-between">
          <Name
            content={conversation.contactName}
            className={isUnread ? "font-semibold" : "text-foreground/90"}
          />
          <span className="text-muted-foreground ml-auto shrink-0 text-[11px]">
            {formatDate(conversation.lastMessageAt)}
          </span>
        </div>
        {conversation.contactHandle && (
          <span className="mt-0.5 flex items-center gap-2 text-[12px]">
            <ChannelBadge channel={conversation.channel} />
            <GraySpan>{conversation.contactHandle}</GraySpan>
          </span>
        )}
        <PreviewText>{conversation.lastMessagePreview}</PreviewText>
      </button>
    </li>
  );
}
