"use client";

import { useParams } from "next/navigation";
import { QueryBoundary } from "../../../components/shared/Boundaries/query-boundary";
import { useListMessages } from "../hooks/use-messages";
import { Message } from "../adapters";

const messageClass: Record<Message["direction"], string> = {
  outbound:
    "bg-card text-card-foreground border-border max-w-[80%] rounded-2xl rounded-bl-md border px-3.5 py-2.5 text-[13.5px] leading-relaxed",
  inbound:
    "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed rounded-br-md bg-primary text-primary-foreground",
};

export const MessagesList = () => {
  const { id } = useParams<{ id: string }>();
  const messages = useListMessages(id);

  return (
    <QueryBoundary
      isLoading={messages.isLoading}
      isEmpty={(messages.data ?? []).length === 0}
      scope="thread"
      error={messages.error}
    >
      <div className="flex flex-col gap-5 overflow-y-scroll">
        {(messages.data ?? []).map((message) => (
          <div className={messageClass[message.direction]} key={message.id}>
            <p>{message.content}</p>
            <span>{message.direction}</span>
          </div>
        ))}
      </div>
    </QueryBoundary>
  );
};
