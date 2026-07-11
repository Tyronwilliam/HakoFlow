"use client";

import { GitMerge, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactMerge } from "@/features/contact-linking/adapters";
import { useUndoMerge } from "@/features/contact-linking/hooks/use-undo-merge";
import { formatDate } from "@/lib/date";

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count > 1 ? plural : singular}`;
}

export function MergeHistoryRow({ merge }: { merge: ContactMerge }) {
  const undo = useUndoMerge();

  return (
    <div className="hover:bg-accent/50 flex items-start gap-3 rounded-lg p-2.5 transition-colors">
      <span className="bg-muted text-muted-foreground border-border mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border">
        <GitMerge className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-semibold">{merge.sourceContact.name}</span> fusionné dans{" "}
          <span className="font-semibold">{merge.targetContact.name}</span>
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {pluralize(merge.movedContactChannelsCount, "canal", "canaux")} ·{" "}
          {pluralize(
            merge.movedConversationsCount,
            "conversation déplacée",
            "conversations déplacées",
          )}
        </p>
        {undo.state.error && <p className="text-destructive mt-1 text-xs">{undo.state.error}</p>}
      </div>
      <span className="text-muted-foreground shrink-0 pt-0.5 text-xs whitespace-nowrap">
        {formatDate(merge.mergedAt)}
      </span>
      {merge.undoneAt ? (
        <Badge variant="secondary">Annulée</Badge>
      ) : (
        <form action={undo.action}>
          <input type="hidden" name="mergeId" value={merge.id} />
          <Button type="submit" size="sm" variant="outline" disabled={undo.isPending}>
            <Undo2 />
            {undo.isPending ? "Annulation…" : "Annuler"}
          </Button>
        </form>
      )}
    </div>
  );
}
