import { Badge } from "@/components/ui/badge";
import { CHANNELS_LIST, Channel as ChannelType } from "../../types/shared";

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
