import { MessagesList } from "../../../../features/message/components/MessagesList";

export default function Thread() {
  return (
    <div className="flex h-full flex-1 overflow-y-scroll">
      <MessagesList />
    </div>
  );
}
