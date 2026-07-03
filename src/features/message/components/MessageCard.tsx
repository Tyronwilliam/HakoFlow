import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Message } from "../adapters";
import { Button } from "../../../components/ui/button";

const messageClass: Record<Message["direction"], string> = {
  inbound: "bg-card text-card-foreground border-border rounded-bl-md border",
  outbound: "ml-auto rounded-br-md bg-primary text-primary-foreground",
};

export const MessageCard = ({ message }: { message: Message }) => {
  const isError = message.status === "error";

  return (
    <div className={cn("w-fit max-w-[80%]", message.direction === "outbound" && "ml-auto")}>
      <div
        className={cn(
          "rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed",
          messageClass[message.direction],
          isError && "border-destructive border",
        )}
      >
        <p>{message.content}</p>
      </div>

      {isError && (
        <div className="mt-1.5 flex flex-col items-center gap-0.5 px-1">
          <div className="text-destructive ml-auto flex gap-1 text-[10px] font-medium">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span className="capitalize">
              Échec de l&apos;envoi — {message.channel} injoignable
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="destructive"
              className="text-destructive/70 hover:text-destructive flex cursor-pointer items-center gap-1 px-2 py-0.5 text-[11px] transition-colors"
            >
              <RefreshCw className="size-3" />
              Réessayer
            </Button>
            <Button
              variant={"ghost"}
              className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 p-0 text-[11px] transition-colors"
            >
              Supprimer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
