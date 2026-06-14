import { faker } from "@faker-js/faker";
import type { UserRow } from "@/types";

export function createUserRow(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    avatar_url: faker.image.avatar(),
    avatar_color: faker.color.rgb(),
    theme: "dark",
    plan: "free",
    plan_ends_at: null,
    created_at: faker.date.past().toISOString(),
    ...overrides,
  };
}

export function createUserRows(count: number, overrides: Partial<UserRow> = {}): UserRow[] {
  return Array.from({ length: count }, () => createUserRow(overrides));
}
