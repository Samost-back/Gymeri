"use client";

// Browser state behind a React hook: server components may import the module's index, and
// this directive keeps the hook out of the server bundle, where Next refuses it.
import { createStore } from "@/shared/lib/store";
import type { User } from "./types";

// undefined: not asked yet; null: asked, nobody is signed in. Shared, so the header and the
// forms agree on who is signed in without reloading.
const session = createStore<User | null | undefined>(undefined);

export const setSessionUser = session.set;
export const useSessionUser = session.use;
