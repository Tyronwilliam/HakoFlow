import { faker } from "@faker-js/faker";
import type { AiSuggestionRow } from "@/types";

export function createAiSuggestionRow(overrides: Partial<AiSuggestionRow> = {}): AiSuggestionRow {
  return {
    id: faker.string.uuid(),
    workspace_id: faker.string.uuid(),
    conversation_id: faker.string.uuid(),
    type: faker.helpers.arrayElement(["reply", "summary"]),
    content: faker.lorem.paragraph(),
    accepted: false,
    created_at: faker.date.recent().toISOString(),
    ...overrides,
  };
}

export function createAiSuggestionRows(
  count: number,
  overrides: Partial<AiSuggestionRow> = {},
): AiSuggestionRow[] {
  return Array.from({ length: count }, () => createAiSuggestionRow(overrides));
}
