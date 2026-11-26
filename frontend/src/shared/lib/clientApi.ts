// Browser-side calls to the backend. Same-origin paths go through the /api proxy in
// next.config, so the session and CSRF cookies belong to the frontend's domain.
const BASE = "/api/v1";

const FALLBACK = "Не вдалося зв'язатися з сервером. Спробуйте ще раз.";

export class ClientApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

// Turns a backend error body into one line for a form. Domain errors come as
// {"detail": "..."}, field checks as {"field": ["..."]}, shown in the form's field order;
// anything else gets a fallback, so the user never sees a raw technical message.
export function errorMessage(
  status: number,
  body: unknown,
  fields: readonly string[] = [],
): string {
  // 403 here is a CSRF failure, whose detail is a technical English text.
  if (status === 403 || status >= 500 || typeof body !== "object" || body === null) {
    return FALLBACK;
  }
  const record = body as Record<string, unknown>;
  if (typeof record.detail === "string") {
    return record.detail;
  }
  for (const field of [...fields, ...Object.keys(record)]) {
    const messages = record[field];
    if (Array.isArray(messages) && typeof messages[0] === "string") {
      return messages[0];
    }
  }
  return FALLBACK;
}

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((pair) => pair.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

// Django rotates the token on sign-in, so it is read fresh before every change.
async function csrfToken(): Promise<string> {
  const existing = readCookie("csrftoken");
  if (existing) {
    return existing;
  }
  await fetch(`${BASE}/auth/csrf`);
  return readCookie("csrftoken") ?? "";
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

// Resolves with the parsed body; leave T as void for an empty answer (204). Throws
// ClientApiError with a message fit for the user; `fields` orders field errors as the form
// shows them.
export async function request<T = void>(
  method: Method,
  path: string,
  body?: unknown,
  fields: readonly string[] = [],
): Promise<T> {
  let response: Response;
  try {
    const headers: Record<string, string> =
      method === "GET" ? {} : { "X-CSRFToken": await csrfToken() };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    response = await fetch(`${BASE}/${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ClientApiError(0, FALLBACK);
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ClientApiError(response.status, errorMessage(response.status, data, fields));
  }
  return data as T;
}
