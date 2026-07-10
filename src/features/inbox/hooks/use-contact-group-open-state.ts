import { useState } from "react";

export function useContactGroupOpenState(containsActiveConversation: boolean) {
  const [open, setOpen] = useState(containsActiveConversation);
  const [trackedActive, setTrackedActive] = useState(containsActiveConversation);

  if (containsActiveConversation !== trackedActive) {
    setTrackedActive(containsActiveConversation);
    if (containsActiveConversation) setOpen(true);
  }

  return { open, setOpen };
}
