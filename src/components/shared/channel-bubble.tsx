import { cn } from "../../lib/utils";
import { ChannelListType } from "../../types";

const CHANNEL_COLORS_BUBBLE: Record<ChannelListType, string> = {
  gmail: "bg-red-700",
  discord: "bg-violet-700",
  slack: "bg-teal-700",
};
export const ChannelBubble = ({ channel }: { channel: ChannelListType }) => {
  return <span className={cn("h-1.5 w-1.5 rounded-full", CHANNEL_COLORS_BUBBLE[channel])}></span>;
};
