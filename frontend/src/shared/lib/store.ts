import { useSyncExternalStore } from "react";

export type Store<T> = {
  get: () => T;
  set: (value: T) => void;
  use: () => T;
};

// One shared value for client components that don't sit under a common parent, such as the
// header and the page body. `initial` is also what the server renders, before any data.
export function createStore<T>(initial: T): Store<T> {
  let current = initial;
  const listeners = new Set<() => void>();

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    get: () => current,
    set: (value) => {
      current = value;
      listeners.forEach((listener) => listener());
    },
    use: () =>
      useSyncExternalStore(
        subscribe,
        () => current,
        () => initial,
      ),
  };
}
