import { cn } from "../../../lib/utils";
import { Message } from "../adapters";
const messageClass: Record<Message["direction"], string> = {
  inbound: "bg-card text-card-foreground border-border rounded-bl-md border",
  outbound: "ml-auto rounded-br-md bg-primary text-primary-foreground",
};

export const MessageCard = ({ message }: { message: Message }) => {
  return (
    <div
      className={cn(
        messageClass[message.direction],
        "w-fit max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed",
      )}
    >
      <p>{message.content}</p>
    </div>
  );
};
