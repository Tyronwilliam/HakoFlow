import { z } from "zod";

export async function fetchApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to fetch");
  }

  return data as T;
}

export function parseApiResponse<T>({
  schema,
  data,
  context,
}: {
  schema: z.ZodType<T>;
  data: unknown;
  context: string;
}): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new Error(`[${context}] ${result.error.message}`);
  }

  return result.data;
}
