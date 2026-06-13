import { Badge } from "@/components/ui/badge";

export type Channel = "gmail" | "discord" | "slack";

const labels: Record<Channel, string> = {
  gmail: "Gmail",
  discord: "Discord",
  slack: "Slack",
};

export function ChannelBadge({ channel }: { channel: Channel }) {
  return <Badge variant="secondary">{labels[channel]}</Badge>;
}
