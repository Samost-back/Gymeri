import { authErrorMessage } from "../model/errors";
import type { Credentials, User } from "../model/types";

export class AuthError extends Error {}

// Browser-side: same-origin paths go through the /api proxy in next.config, so the session
// and CSRF cookies belong to the frontend's domain.
const BASE = "/api/v1/auth";

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((pair) => pair.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

// Django rotates the token on sign-in, so it is read fresh before every POST.
async function csrfToken(): Promise<string> {
  const existing = readCookie("csrftoken");
  if (existing) {
    return existing;
  }
  await fetch(`${BASE}/csrf`);
  return readCookie("csrftoken") ?? "";
}

async function post(path: string, body?: Credentials): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${BASE}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": await csrfToken() },
      body: body && JSON.stringify(body),
    });
  } catch {
    throw new AuthError(authErrorMessage(0, null));
  }
  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => null);
    throw new AuthError(authErrorMessage(response.status, errorBody));
  }
  return response;
}

export async function register(credentials: Credentials): Promise<User> {
  return (await (await post("register", credentials)).json()) as User;
}

export async function login(credentials: Credentials): Promise<User> {
  return (await (await post("login", credentials)).json()) as User;
}

export async function logout(): Promise<void> {
  await post("logout");
}

// null when nobody is signed in or the backend can't be reached: the site works as a guest.
export async function fetchMe(): Promise<User | null> {
  try {
    const response = await fetch(`${BASE}/me`);
    return response.ok ? ((await response.json()) as User) : null;
  } catch {
    return null;
  }
}
