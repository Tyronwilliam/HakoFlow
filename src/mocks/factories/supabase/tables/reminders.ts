import { faker } from "@faker-js/faker";
import type { ReminderRow } from "@/types";

export function createReminderRow(overrides: Partial<ReminderRow> = {}): ReminderRow {
  return {
    id: faker.string.uuid(),
    workspace_id: faker.string.uuid(),
    conversation_id: faker.string.uuid(),
    remind_at: faker.date.future().toISOString(),
    note: faker.lorem.sentence(),
    done: false,
    created_at: faker.date.past().toISOString(),
    ...overrides,
  };
}

export function createReminderRows(
  count: number,
  overrides: Partial<ReminderRow> = {},
): ReminderRow[] {
  return Array.from({ length: count }, () => createReminderRow(overrides));
}
