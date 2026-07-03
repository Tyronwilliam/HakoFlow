import { MessagesList } from "../../../../features/message/components/MessagesList";
import { ThreadHeader } from "../../../../features/message/components/ThreadHeader";

export default function Thread() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <ThreadHeader />
      <div className="min-h-0 flex-1">
        <MessagesList />
      </div>
    </div>
  );
}
