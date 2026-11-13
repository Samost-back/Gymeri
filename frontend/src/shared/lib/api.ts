export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export type QueryValue = string | string[] | undefined;

// Server-side only: BACKEND_URL is not exposed to the browser.
export async function apiGet<T>(path: string, query: Record<string, QueryValue> = {}): Promise<T> {
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) {
    throw new Error("BACKEND_URL is not set");
  }

  const url = new URL(`/api/v1/${path}`, baseUrl);
  for (const [key, value] of Object.entries(query)) {
    for (const item of [value].flat()) {
      if (item) {
        url.searchParams.append(key, item);
      }
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new ApiError(response.status, `GET ${url.pathname} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}
