import { CHANNELS_LIST } from "@/lib/constant/channels";
import { Badge } from "../base/Badge";
import { ChannelListType } from "@/types";
import { cn } from "../../lib/utils";

const CHANNEL_COLORS: Record<ChannelListType, string> = {
  gmail: "bg-red-100 text-red-700",
  discord: "bg-violet-100 text-violet-700",
  slack: "bg-teal-100 text-teal-700",
};
const CHANNEL_COLORS_BUBBLE: Record<ChannelListType, string> = {
  gmail: "bg-red-700",
  discord: "bg-violet-700",
  slack: "bg-teal-700",
};

export function ChannelBadge({ channel }: { channel: ChannelListType }) {
  return (
    <Badge
      className={(CHANNEL_COLORS[channel], "text-primary gap-1.5 rounded-md text-[12px]")}
      variant={"secondary"}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", CHANNEL_COLORS_BUBBLE[channel])}></span>
      {CHANNELS_LIST[channel]}
    </Badge>
  );
}
