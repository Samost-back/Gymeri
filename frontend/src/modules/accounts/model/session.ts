import { useSyncExternalStore } from "react";
import type { User } from "./types";

// undefined: not asked yet; null: asked, nobody is signed in.
type SessionState = User | null | undefined;

let current: SessionState;
const listeners = new Set<() => void>();

// One shared value, so the header and the forms agree on who is signed in without reloading.
export function setSessionUser(user: User | null): void {
  current = user;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSessionUser(): SessionState {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => undefined,
  );
}
