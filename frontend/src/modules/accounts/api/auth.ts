import { request } from "@/shared/lib/clientApi";
import type { Credentials, User } from "../model/types";

// The email problem is the one to fix first.
const FIELDS = ["email", "password"] as const;

function send(path: string, credentials: Credentials): Promise<User> {
  return request<User>("POST", `auth/${path}`, credentials, FIELDS);
}

export function register(credentials: Credentials): Promise<User> {
  return send("register", credentials);
}

export function login(credentials: Credentials): Promise<User> {
  return send("login", credentials);
}

export async function logout(): Promise<void> {
  await request("POST", "auth/logout");
}

// null when nobody is signed in or the backend can't be reached: the site works as a guest.
export async function fetchMe(): Promise<User | null> {
  try {
    return await request<User>("GET", "auth/me");
  } catch {
    return null;
  }
}
