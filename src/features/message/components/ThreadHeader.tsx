"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { useConversationDetail } from "@/features/inbox/hooks/use-conversation-detail";
import { GroupConversationsWizard } from "@/features/contacts/components/group-conversations-wizard";

export const ThreadHeader = () => {
  const { id } = useParams<{ id: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const conversation = useConversationDetail(id);

  if (!conversation.data) return null;

  return (
    <div className="flex items-center justify-between gap-2 border-b p-3">
      <div className="flex items-center gap-2">
        <ChannelBadge channel={conversation.data.channel} />
        <span className="text-sm font-medium">{conversation.data.contactName ?? "Non lié"}</span>
        {conversation.data.contactHandle && (
          <span className="text-muted-foreground text-sm">{conversation.data.contactHandle}</span>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
          Regrouper sous un contact
        </Button>
        <DialogContent className="sm:max-w-md">
          <GroupConversationsWizard
            conversationId={conversation.data.id}
            currentProvider={conversation.data.channel}
            currentExternalId={conversation.data.externalId}
            currentDisplayHandle={conversation.data.contactHandle}
            onOpenChange={setIsDialogOpen}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
