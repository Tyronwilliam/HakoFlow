export async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to fetch");
  }

  return data as T;
}
