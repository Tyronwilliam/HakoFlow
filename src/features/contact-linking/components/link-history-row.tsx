"use client";

import { Link2, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactLinkHistory } from "@/features/contact-linking/adapters";
import { useUndoLink } from "@/features/contact-linking/hooks/use-undo-link";
import { formatDate } from "@/lib/date";

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count > 1 ? plural : singular}`;
}

export function LinkHistoryRow({ entry }: { entry: ContactLinkHistory }) {
  const undo = useUndoLink();

  return (
    <div className="hover:bg-accent/50 flex items-start gap-3 rounded-lg p-2.5 transition-colors">
      <span className="bg-muted text-muted-foreground border-border mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border">
        <Link2 className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          Canal <span className="font-semibold">{entry.provider}</span> de{" "}
          <span className="font-semibold">{entry.sourceContact.name}</span> rattaché à{" "}
          <span className="font-semibold">{entry.targetContact.name}</span>
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {pluralize(
            entry.movedConversationsCount,
            "conversation déplacée",
            "conversations déplacées",
          )}
        </p>
        {undo.state.error && <p className="text-destructive mt-1 text-xs">{undo.state.error}</p>}
      </div>
      <span className="text-muted-foreground shrink-0 pt-0.5 text-xs whitespace-nowrap">
        {formatDate(entry.linkedAt)}
      </span>
      {entry.undoneAt ? (
        <Badge variant="secondary">Annulé</Badge>
      ) : (
        <form action={undo.action}>
          <input type="hidden" name="linkHistoryId" value={entry.id} />
          <Button type="submit" size="sm" variant="outline" disabled={undo.isPending}>
            <Undo2 />
            {undo.isPending ? "Annulation…" : "Annuler"}
          </Button>
        </form>
      )}
    </div>
  );
}
