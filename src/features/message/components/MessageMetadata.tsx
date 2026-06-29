import { ChannelBubble } from "../../../components/shared/channel-bubble";
import { cn } from "../../../lib/utils";
import { formatDate } from "../../../lib/date";
import { Message } from "../adapters";

const detailClass: Record<Message["direction"], string> = {
  inbound: "",
  outbound: "justify-end",
};
export const MessageMetadata = ({ message }: { message: Message }) => {
  return (
    <div className={cn("mb-2 flex items-center gap-1.5 px-1", detailClass[message.direction])}>
      <span className="text-muted-foreground/70 flex items-center gap-1.5 text-[10.5px] font-medium tracking-wide capitalize">
        <ChannelBubble channel={message.channel} />
        {message.channel}
      </span>
      <div className="text-muted-foreground/60 flex items-center gap-1 text-[11px]">
        <span>-</span>
        {formatDate(message.sentAt)}
      </div>
    </div>
  );
};
