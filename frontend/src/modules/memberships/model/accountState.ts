"use client";

// Browser state behind a React hook: server components may import the module's index, and
// this directive keeps the hook out of the server bundle, where Next refuses it.
import { createStore } from "@/shared/lib/store";
import type { Account, MembershipCard } from "./types";

// undefined: not loaded yet (or a guest). Shared by the account section, the hero wrapper and
// the catalog cards' choose buttons.
export const accountStore = createStore<Account | undefined>(undefined);

export function replaceCard(card: MembershipCard): void {
  const account = accountStore.get();
  if (account) {
    accountStore.set({
      ...account,
      memberships: account.memberships.map((item) => (item.id === card.id ? card : item)),
    });
  }
}

export function removeCard(id: number): void {
  const account = accountStore.get();
  if (account) {
    accountStore.set({
      ...account,
      memberships: account.memberships.filter((item) => item.id !== id),
    });
  }
}
