"use client";
import { ArrowLeft } from "lucide-react";
import { Paragraph } from "@/components/shared/Text/Paragraph";
import { CHANNELS_LIST } from "@/lib/constant/channels";
import type { ChannelListType } from "@/types";
import type { ContactConversationGroup } from "@/features/inbox/adapters";
import { ConversationListItem } from "@/features/inbox/components/conversation-list-item";

interface ContactGroupDetailProps {
  group: ContactConversationGroup;
  onBack: () => void;
}

export function ContactGroupDetail({ group, onBack }: ContactGroupDetailProps) {
  const channelsByPresence = (Object.keys(CHANNELS_LIST) as ChannelListType[]).filter((channel) =>
    group.channels.includes(channel),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex items-center gap-2 border-b px-4 py-3">
        <button
          className="hover:bg-secondary/40 -ml-1.5 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors"
          onClick={onBack}
          aria-label="back-to-conversations"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Paragraph type="regular" className="text-foreground/90">
          {group.contactName}
        </Paragraph>
      </div>

      <ul className="divide-y overflow-y-auto">
        {channelsByPresence.map((channel) => (
          <li key={channel}>
            <p className="text-muted-foreground px-4 pt-2 pb-1 text-[11px] font-medium uppercase">
              {CHANNELS_LIST[channel]}
            </p>
            <ul className="divide-y">
              {group.conversations
                .filter((conversation) => conversation.channel === channel)
                .map((conversation) => (
                  <ConversationListItem key={conversation.id} conversation={conversation} />
                ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
