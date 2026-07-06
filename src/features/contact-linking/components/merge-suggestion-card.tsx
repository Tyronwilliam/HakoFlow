"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MergeSuggestion } from "@/features/contact-linking/adapters";
import { useMergeSuggestionActions } from "@/features/contact-linking/hooks/use-merge-suggestion-actions";

export function MergeSuggestionCard({ suggestion }: { suggestion: MergeSuggestion }) {
  const { merge, ignore } = useMergeSuggestionActions();

  const isPending = merge.isPending || ignore.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {suggestion.contactA.name} ↔ {suggestion.contactB.name}
          <Badge variant="secondary">{Math.round(suggestion.score * 100)}% de similarité</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        Raison : {suggestion.reason}
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          size="sm"
          disabled={isPending}
          onClick={() =>
            merge.mutate({ suggestionId: suggestion.id, keepContactId: suggestion.contactA.id })
          }
        >
          Fusionner vers {suggestion.contactA.name}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            merge.mutate({ suggestionId: suggestion.id, keepContactId: suggestion.contactB.id })
          }
        >
          Fusionner vers {suggestion.contactB.name}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => ignore.mutate(suggestion.id)}
        >
          Ignorer
        </Button>
      </CardFooter>
    </Card>
  );
}
