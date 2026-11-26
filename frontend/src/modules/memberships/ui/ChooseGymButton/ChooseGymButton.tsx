"use client";

import { useState } from "react";
import { useSessionUser } from "@/modules/accounts";
import { ClientApiError } from "@/shared/lib/clientApi";
import { Button, Icon, Tag } from "@/shared/ui";
import { chooseGym } from "../../api/memberships";
import { accountStore } from "../../model/accountState";
import styles from "./ChooseGymButton.module.css";

// Shown on a catalog card in the account: guests see nothing, a client picks the gym here.
export function ChooseGymButton({ gymSlug }: { gymSlug: string }) {
  const user = useSessionUser();
  const account = accountStore.use();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Waits for the account too, so the button never offers the gym that is already chosen.
  if (!user || !account) {
    return null;
  }
  if (account.gym?.slug === gymSlug) {
    return (
      <Tag variant="solid">
        <Icon name="check" size={14} />
        Мій зал
      </Tag>
    );
  }

  async function choose() {
    setPending(true);
    setError(null);
    try {
      accountStore.set(await chooseGym(gymSlug));
      // The «Мій зал» section may appear only now; wait a frame for React to draw it.
      requestAnimationFrame(() => document.getElementById("my-gym")?.scrollIntoView());
    } catch (caught) {
      setError(caught instanceof ClientApiError ? caught.message : "Щось пішло не так.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <Button variant="outline" disabled={pending} onClick={choose}>
        <Icon name="fitness_center" size={18} />
        Обрати як мій зал
      </Button>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
