"use client";

import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMergeSuggestions } from "@/features/contact-linking/hooks/use-merge-suggestions";
import { MergeSuggestionsList } from "@/features/contact-linking/components/merge-suggestions-list";

export function MergeSuggestionsTrigger() {
  const suggestions = useMergeSuggestions();
  const pendingCount = suggestions.data?.length ?? 0;

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        <Users />
        {pendingCount > 0 && (
          <Badge variant="destructive" className="absolute -top-1 -right-1">
            {pendingCount}
          </Badge>
        )}
        <span className="sr-only">Suggestions de fusion de contacts</span>
      </DialogTrigger>
      <DialogContent className="min-w-fit sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Suggestions de fusion</DialogTitle>
        </DialogHeader>
        <MergeSuggestionsList />
      </DialogContent>
    </Dialog>
  );
}
