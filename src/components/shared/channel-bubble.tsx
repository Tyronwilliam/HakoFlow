import { cn } from "../../lib/utils";
import { ChannelListType } from "../../types";

const CHANNEL_COLORS_BUBBLE: Record<ChannelListType, string> = {
  gmail: "bg-channel-gmail",
  discord: "bg-channel-discord",
  slack: "bg-channel-slack",
};
export const ChannelBubble = ({ channel }: { channel: ChannelListType }) => {
  return <span className={cn("h-1.5 w-1.5 rounded-full", CHANNEL_COLORS_BUBBLE[channel])}></span>;
};
