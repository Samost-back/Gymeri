"use client";

import { useEffect, useState } from "react";
import { useSessionUser } from "@/modules/accounts";
import { ClientApiError } from "@/shared/lib/clientApi";
import { Button, ConfirmDialog, Icon } from "@/shared/ui";
import { clearGym, getAccount } from "../../api/memberships";
import { accountStore } from "../../model/accountState";
import { MembershipCardView } from "./MembershipCard";
import { MembershipForm } from "./MembershipForm";
import styles from "./MyAccount.module.css";
import { MyGymCard } from "./MyGymCard";

// The signed-in part of the account page: the chosen gym and the memberships. A fresh account
// has neither, so it shows nothing here and the page starts with the catalog search, where
// the gym is chosen on its card; a guest sees nothing here either.
export function MyAccount() {
  const user = useSessionUser();
  const account = accountStore.use();
  const [formOpen, setFormOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  // Kept with the user it happened to, so a later sign-in doesn't show someone else's error.
  const [loadError, setLoadError] = useState<{ userId: number; message: string } | null>(null);

  useEffect(() => {
    if (!user) {
      // Signed out: forget the previous client's data.
      accountStore.set(undefined);
      return;
    }
    getAccount()
      .then(accountStore.set)
      .catch((error: unknown) =>
        setLoadError({
          userId: user.id,
          message: error instanceof ClientApiError ? error.message : "Щось пішло не так.",
        }),
      );
  }, [user]);

  if (!user) {
    return null;
  }
  if (!account) {
    // Nothing while loading: most of the time it is a moment, and a placeholder would flicker.
    return loadError?.userId === user.id ? (
      <p role="alert" className={styles.error}>
        {loadError.message}
      </p>
    ) : null;
  }

  const { gym, memberships } = account;

  async function removeGym() {
    setConfirmingRemoval(false);
    setActionError(null);
    try {
      accountStore.set(await clearGym());
    } catch (error) {
      setActionError(error instanceof ClientApiError ? error.message : "Щось пішло не так.");
    }
  }

  // Memberships stay visible even if their gym has left the catalog, so none get lost.
  if (!gym && memberships.length === 0) {
    return null;
  }
  return (
    // One panel for both, set apart from the catalog cards below: this is the client's own.
    <section id="my-gym" className={styles.panel} aria-label="Мій кабінет">
      {gym && (
        <div className={styles.block}>
          <div className={styles.blockHead}>
            <h2 className={styles.blockTitle}>Мій зал</h2>
            <div className={styles.headActions}>
              <a href="#find-gym" className={styles.textLink}>
                Змінити
              </a>
              <button
                type="button"
                className={styles.textLink}
                onClick={() => setConfirmingRemoval(true)}
              >
                Прибрати
              </button>
            </div>
          </div>
          <MyGymCard gym={gym} />
          {actionError && (
            <p role="alert" className={styles.error}>
              {actionError}
            </p>
          )}
          <ConfirmDialog
            open={confirmingRemoval}
            title="Прибрати зал з кабінету?"
            message="Абонементи залишаться, але нові можна буде додати лише до обраного залу."
            confirmLabel="Прибрати"
            onConfirm={removeGym}
            onCancel={() => setConfirmingRemoval(false)}
          />
        </div>
      )}

      <div className={styles.block}>
        <div className={styles.blockHead}>
          <h2 className={styles.blockTitle}>Мої абонементи</h2>
          {gym && !formOpen && (
            <Button className={styles.smallButton} onClick={() => setFormOpen(true)}>
              <Icon name="card_membership" size={16} />
              Додати
            </Button>
          )}
        </div>
        {gym && formOpen && (
          <MembershipForm plans={gym.plans} onDone={() => setFormOpen(false)} />
        )}
        {memberships.length > 0 ? (
          <div className={styles.cards}>
            {memberships.map((card) => (
              <MembershipCardView key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <p className={styles.muted}>
            Поки що абонементів немає. Додайте свій, щоб кабінет рахував дні.
          </p>
        )}
      </div>
    </section>
  );
}
