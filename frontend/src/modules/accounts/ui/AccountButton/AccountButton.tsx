"use client";

import { useEffect } from "react";
import { Button, ButtonLink, Icon } from "@/shared/ui";
import { fetchMe, logout } from "../../api/auth";
import { setSessionUser, useSessionUser } from "../../model/session";

type AccountButtonProps = { className?: string };

// Several buttons can be on one page (header, hero); they share one request for the user.
let sessionRequest: Promise<void> | undefined;

function loadSession(): Promise<void> {
  sessionRequest ??= fetchMe().then(setSessionUser);
  return sessionRequest;
}

// "Увійти" for guests, "Вийти" for a signed-in user. Asks the backend once per page load;
// the forms update the shared session afterwards.
export function AccountButton({ className }: AccountButtonProps) {
  const user = useSessionUser();

  useEffect(() => {
    if (user === undefined) {
      loadSession();
    }
  }, [user]);

  if (user) {
    return (
      <Button
        variant="outline"
        className={className}
        title={user.email}
        onClick={() =>
          logout()
            .then(() => setSessionUser(null))
            // The session is still alive, so the button stays and the user can try again.
            .catch(() => undefined)
        }
      >
        <Icon name="logout" size={18} />
        Вийти
      </Button>
    );
  }
  return (
    <ButtonLink href="/login" className={className}>
      <Icon name="login" size={18} />
      Увійти
    </ButtonLink>
  );
}
