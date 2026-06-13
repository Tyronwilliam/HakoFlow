import { Badge } from "@/components/ui/badge";
import { type Channel as ChannelType } from "@/types";

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

export function ChannelBadge({ channel }: { channel: ChannelType }) {
  return (
    <Badge variant="secondary" className={CHANNEL_COLORS[channel]}>
      {CHANNELS_LIST[channel]}
    </Badge>
  );
}
