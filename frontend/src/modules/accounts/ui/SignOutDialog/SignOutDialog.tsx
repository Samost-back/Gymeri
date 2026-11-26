"use client";

import { ConfirmDialog } from "@/shared/ui";
import { logout } from "../../api/auth";
import { setSessionUser, signOutPrompt } from "../../model/session";

// The one sign-out confirmation for the page, opened by any «Вийти» button.
export function SignOutDialog() {
  const open = signOutPrompt.use();

  const signOut = () => {
    signOutPrompt.set(false);
    logout()
      .then(() => setSessionUser(null))
      // The session is still alive, so the button stays and the user can try again.
      .catch(() => undefined);
  };

  return (
    <ConfirmDialog
      open={open}
      title="Вийти з акаунта?"
      message="Щоб повернутися, знадобиться пароль."
      confirmLabel="Вийти"
      onConfirm={signOut}
      onCancel={() => signOutPrompt.set(false)}
    />
  );
}
