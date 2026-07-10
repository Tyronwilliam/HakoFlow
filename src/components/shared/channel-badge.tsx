import { CHANNELS_LIST } from "@/lib/constant/channels";
import { Badge } from "../base/Badge";
import { ChannelListType } from "@/types";
import { ChannelBubble } from "./channel-bubble";
import { cn } from "@/lib/utils";

const CHANNEL_COLORS: Record<ChannelListType, string> = {
  gmail: "bg-channel-gmail/15 text-channel-gmail",
  discord: "bg-channel-discord/15 text-channel-discord",
  slack: "bg-channel-slack/15 text-channel-slack",
};

export function ChannelBadge({ channel }: { channel: ChannelListType }) {
  return (
    <Badge
      className={cn(CHANNEL_COLORS[channel], "gap-1.5 rounded-md text-[12px]")}
      variant={"secondary"}
    >
      <ChannelBubble channel={channel} />
      {CHANNELS_LIST[channel]}
    </Badge>
  );
}
