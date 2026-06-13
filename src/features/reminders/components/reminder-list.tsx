"use client";

import { useReminders } from "@/features/reminders/hooks/use-reminders";
import { EmptyState } from "@/components/shared/empty-state";

export function ReminderList() {
  const { data: reminders = [] } = useReminders();

  if (reminders.length === 0) {
    return <EmptyState title="No reminders" description="You're all caught up." />;
  }

  return (
    <ul className="divide-y">
      {reminders.map((reminder) => (
        <li key={reminder.id} className="flex items-center justify-between py-3">
          <p className="text-sm font-medium">{reminder.title}</p>
          <p className="text-muted-foreground text-sm">{reminder.dueAt}</p>
        </li>
      ))}
    </ul>
  );
}
