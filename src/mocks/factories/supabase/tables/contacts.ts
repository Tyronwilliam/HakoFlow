import { faker } from "@faker-js/faker";
import type { ContactRow } from "@/types";

export function createContactRow(overrides: Partial<ContactRow> = {}): ContactRow {
  return {
    id: faker.string.uuid(),
    workspace_id: faker.string.uuid(),
    name: faker.person.fullName(),
    notes: faker.lorem.sentence(),
    tags: faker.helpers.arrayElements(["prospect_chaud", "client", "froid"], { min: 0, max: 2 }),
    blacklisted: false,
    enriched: false,
    deleted_at: null,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides,
  };
}

export function createContactRows(
  count: number,
  overrides: Partial<ContactRow> = {},
): ContactRow[] {
  return Array.from({ length: count }, () => createContactRow(overrides));
}
