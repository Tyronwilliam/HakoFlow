import { faker } from "@faker-js/faker";
import type { WorkspaceRow } from "@/types";

export function createWorkspaceRow(overrides: Partial<WorkspaceRow> = {}): WorkspaceRow {
  return {
    id: faker.string.uuid(),
    user_id: faker.string.uuid(),
    name: faker.helpers.arrayElement(["Pro", "Perso", "Freelance"]),
    avatar_color: faker.color.rgb(),
    is_default: false,
    created_at: faker.date.past().toISOString(),
    ...overrides,
  };
}

export function createWorkspaceRows(
  count: number,
  overrides: Partial<WorkspaceRow> = {},
): WorkspaceRow[] {
  return Array.from({ length: count }, () => createWorkspaceRow(overrides));
}
