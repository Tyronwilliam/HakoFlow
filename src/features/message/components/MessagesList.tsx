"use client";

import { useParams } from "next/navigation";
import { QueryBoundary } from "../../../components/shared/Boundaries/query-boundary";
import { useListMessages } from "../hooks/use-messages";
import { MessageFeed } from "./MessageFeed";

export const MessagesList = () => {
  const { id } = useParams<{ id: string }>();
  const messages = useListMessages(id);
  return (
    <QueryBoundary
      isLoading={messages.isLoading}
      isEmpty={(messages.data ?? []).length === 0}
      scope="thread"
      error={messages.error}
      emptyAction={{ label: "Envoyer un message", onClick: () => {} }}
      emptyDescription="Commencez la conversation."
      emptyTitle="Aucun message"
    >
      <MessageFeed messages={messages} />
    </QueryBoundary>
  );
};
