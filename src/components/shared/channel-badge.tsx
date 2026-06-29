import { CHANNELS_LIST } from "@/lib/constant/channels";
import { Badge } from "../base/Badge";
import { ChannelListType } from "@/types";
import { ChannelBubble } from "./channel-bubble";

const CHANNEL_COLORS: Record<ChannelListType, string> = {
  gmail: "bg-red-100 text-red-700",
  discord: "bg-violet-100 text-violet-700",
  slack: "bg-teal-100 text-teal-700",
};

export function ChannelBadge({ channel }: { channel: ChannelListType }) {
  return (
    <Badge
      className={(CHANNEL_COLORS[channel], "gap-1.5 rounded-md text-[12px]")}
      variant={"secondary"}
    >
      <ChannelBubble channel={channel} />
      {CHANNELS_LIST[channel]}
    </Badge>
  );
}
