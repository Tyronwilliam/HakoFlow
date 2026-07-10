"use client";
import { useParams } from "next/navigation";
import { Collapsible } from "@/components/ui/collapsible";
import type { ContactConversationGroup } from "@/features/inbox/adapters";
import { ConversationListItem } from "@/features/inbox/components/conversation-list-item";
import { ContactGroupConversationList } from "@/features/inbox/components/contact-group-conversation-list";
import { ContactGroupTrigger } from "@/features/inbox/components/contact-group-trigger";
import { useContactGroupOpenState } from "@/features/inbox/hooks/use-contact-group-open-state";

interface ContactGroupListItemProps {
  group: ContactConversationGroup;
}

export function ContactGroupListItem({ group }: ContactGroupListItemProps) {
  const params = useParams();
  const containsActiveConversation = group.conversations.some(
    (conversation) => conversation.id === params.id,
  );
  const { open, setOpen } = useContactGroupOpenState(containsActiveConversation);

  if (group.conversations.length === 1) {
    return <ConversationListItem conversation={group.conversations[0]} />;
  }

  return (
    <Collapsible render={<li className="relative" />} open={open} onOpenChange={setOpen}>
      <ContactGroupTrigger group={group} open={open} />
      <ContactGroupConversationList conversations={group.conversations} />
    </Collapsible>
  );
}
