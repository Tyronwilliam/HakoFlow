import { z } from "zod";

export const groupConversationsSchema = z.object({
  targetContactId: z.uuid({ message: "Choisissez un contact." }),
  conversationIds: z.array(z.uuid()).min(1).max(50),
});

export type GroupConversationsInput = z.infer<typeof groupConversationsSchema>;
