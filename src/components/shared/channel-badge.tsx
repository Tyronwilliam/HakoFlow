import { Badge } from "@/components/ui/badge";
import { type Channel as ChannelType } from "@/types";

export const CHANNELS_LIST = {
  gmail: "Gmail",
  discord: "Discord",
  slack: "Slack",
} as const;

const CHANNEL_COLORS_BG: Record<ChannelType, string> = {
  gmail: "bg-red-100 text-red-700",
  discord: "bg-violet-100 text-violet-700",
  slack: "bg-teal-100 text-teal-700",
};
const CHANNEL_COLORS_TEXT: Record<ChannelType, string> = {
  gmail: "bg-red-700",
  discord: "bg-violet-700",
  slack: "bg-teal-700",
};

export function ChannelBadge({ channel }: { channel: ChannelType }) {
  return (
    <Badge
      variant="secondary"
      className={`${CHANNEL_COLORS_BG[channel]} mt-0.5 flex items-center gap-2 rounded-md text-[12px]`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${CHANNEL_COLORS_TEXT[channel]}`}></span>
      {CHANNELS_LIST[channel]}
    </Badge>
  );
}
