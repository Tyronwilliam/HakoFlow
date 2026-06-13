import { z } from "zod";

export const reminderSchema = z.object({
  title: z.string().min(1),
  dueAt: z.string().datetime(),
});

export type ReminderInput = z.infer<typeof reminderSchema>;
