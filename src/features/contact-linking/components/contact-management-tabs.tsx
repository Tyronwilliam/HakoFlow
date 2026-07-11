"use client";

import { GitMerge, History, Link2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LinkContactDialog } from "@/features/contact-linking/components/link-contact-dialog";
import { MergeSuggestionsList } from "@/features/contact-linking/components/merge-suggestions-list";
import { MergeHistoryList } from "@/features/contact-linking/components/merge-history-list";
import { LinkHistoryList } from "@/features/contact-linking/components/link-history-list";
import { useMergeSuggestions } from "@/features/contact-linking/hooks/use-merge-suggestions";
import { useContactMerges } from "@/features/contact-linking/hooks/use-contact-merges";
import { useContactLinkHistory } from "@/features/contact-linking/hooks/use-contact-link-history";

export function ContactManagementTabs() {
  const suggestions = useMergeSuggestions();
  const merges = useContactMerges();
  const linkHistory = useContactLinkHistory();

  const suggestionCount = suggestions.data?.length ?? 0;
  const historyCount = (merges.data?.length ?? 0) + (linkHistory.data?.length ?? 0);

  return (
    <Tabs defaultValue="link" className={"w-full"}>
      <TabsList variant="line" className="w-full justify-start border-b">
        <TabsTrigger value="link" className="flex-none">
          <Link2 />
          Associer un canal
        </TabsTrigger>
        <TabsTrigger value="merge" className="flex-none">
          <GitMerge />
          Suggestions de fusion
          {suggestionCount > 0 && <Badge>{suggestionCount}</Badge>}
        </TabsTrigger>
        <TabsTrigger value="history" className="flex-none">
          <History />
          Historique
          {historyCount > 0 && <Badge variant="secondary">{historyCount}</Badge>}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="link" className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground max-w-md text-sm">
            Sélectionne un ou plusieurs canaux, où qu&apos;ils se trouvent, et rattache-les au bon
            contact.
          </p>
          <LinkContactDialog />
        </div>
      </TabsContent>

      <TabsContent value="merge" className="space-y-4 pt-2">
        <p className="text-muted-foreground max-w-md text-sm">
          Le système détecte des doublons potentiels entre contacts déjà existants — tu valides ou
          ignores.
        </p>
        <MergeSuggestionsList />
      </TabsContent>

      <TabsContent value="history" className="space-y-6 pt-2">
        <div className="space-y-4">
          <p className="text-muted-foreground max-w-md text-sm">
            Retrouve les fusions déjà appliquées — annule celles qui ne conviennent pas.
          </p>
          <MergeHistoryList />
        </div>
        <div className="space-y-4">
          <p className="text-muted-foreground max-w-md text-sm">
            Retrouve les canaux rattachés manuellement à un contact.
          </p>
          <LinkHistoryList />
        </div>
      </TabsContent>
    </Tabs>
  );
}
