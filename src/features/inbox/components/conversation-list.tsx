"use client";

import { useConversations } from "@/features/inbox/hooks/use-conversations";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { QueryBoundary } from "@/components/shared/query-boundary";

export function ConversationList() {
  const { data: conversations = [], isLoading, error } = useConversations();
  // Faire une substring sur les conversation venant des API Channel
  return (
    <QueryBoundary
      isLoading={isLoading}
      isEmpty={conversations.length === 0}
      scope="inbox"
      error={error}
    >
      <ul className="divide-y">
        {conversations.map((conversation) => (
          <li
            key={conversation.id}
            className="hover:bg-secondary/40 relative flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors"
          >
            <div>
              <p className="text-foreground truncate text-[14px] font-semibold">
                {conversation.contactName}
              </p>

              {conversation.contactHandle && (
                <span className="mt-0.5 flex items-center gap-2 text-[12px]">
                  <ChannelBadge channel={conversation.channel} />
                  <span className="text-muted-foreground/80 truncate text-[12px]">
                    {conversation.contactHandle}
                  </span>
                </span>
              )}
              <p className="text-foreground/80 mt-1.5 line-clamp-2 text-[13px] leading-relaxed">
                {conversation.lastMessagePreview}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </QueryBoundary>
  );
}
