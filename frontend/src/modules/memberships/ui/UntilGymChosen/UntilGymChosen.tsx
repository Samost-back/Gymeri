"use client";

import type { ReactNode } from "react";
import { accountStore } from "../../model/accountState";

// Shows its content to guests and to clients still choosing a gym. Once a gym is chosen, the
// account panel takes the top of the page and the intro would only push it down. The account
// loads in the browser, so a client with a gym sees the intro for a moment first; hiding it
// on the server would need the server to read the session.
export function UntilGymChosen({ children }: { children: ReactNode }) {
  const account = accountStore.use();
  return account?.gym ? null : children;
}
