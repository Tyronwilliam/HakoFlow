import { z } from "zod";

export const groupConversationsSchema = z
  .object({
    targetContactId: z.string().uuid().nullable(),
    newContactName: z.string().trim().min(1).max(200).optional(),
    conversationIds: z.array(z.string().uuid()).min(1).max(3),
  })
  .refine((data) => data.targetContactId !== null || !!data.newContactName, {
    message: "Choisissez un contact existant ou un nom pour en créer un.",
    path: ["newContactName"],
  });

export type GroupConversationsInput = z.infer<typeof groupConversationsSchema>;
