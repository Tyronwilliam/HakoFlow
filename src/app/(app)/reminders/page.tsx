import { ReminderList } from "@/features/reminders/components/reminder-list";

export default function RemindersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reminders</h1>
      <ReminderList />
    </div>
  );
}
