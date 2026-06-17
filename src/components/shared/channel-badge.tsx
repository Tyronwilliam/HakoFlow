import { CHANNELS_LIST } from "@/lib/constant/channels";
import { Badge } from "../base/Badge";
import { ChannelListType } from "@/types";

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
      colorDot={CHANNEL_COLORS_BUBBLE[channel]}
      className={CHANNEL_COLORS[channel]}
      content={CHANNELS_LIST[channel]}
    />
  );
}
