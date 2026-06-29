import { MessageSquare } from "lucide-react";

export default function InboxPage() {
  return (
    <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
      <MessageSquare className="h-8 w-8" />
      <p className="text-sm">Sélectionne une conversation</p>
    </div>
  );
}
