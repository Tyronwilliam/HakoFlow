import { type Channel as ChannelType } from "@/types";
import { Badge } from "../base/Badge";

export const CHANNELS_LIST = {
  gmail: "Gmail",
  discord: "Discord",
  slack: "Slack",
} as const;

const CHANNEL_COLORS: Record<ChannelType, string> = {
  gmail: "bg-red-100 text-red-700",
  discord: "bg-violet-100 text-violet-700",
  slack: "bg-teal-100 text-teal-700",
};
const CHANNEL_COLORS_BUBBLE: Record<ChannelType, string> = {
  gmail: "bg-red-700",
  discord: "bg-violet-700",
  slack: "bg-teal-700",
};

export function ChannelBadge({ channel }: { channel: ChannelType }) {
  return (
    <Badge
      colorDot={CHANNEL_COLORS_BUBBLE[channel]}
      className={CHANNEL_COLORS[channel]}
      content={CHANNELS_LIST[channel]}
    />
  );
}
