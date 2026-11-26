"use client";

import { useState } from "react";
import { ClientApiError } from "@/shared/lib/clientApi";
import { formatPrice } from "@/shared/lib/format";
import { Button, ConfirmDialog, Icon, Tag } from "@/shared/ui";
import { cancelVisitToday, deleteMembership, markVisitToday } from "../../api/memberships";
import { removeCard, replaceCard } from "../../model/accountState";
import { STATUS_LABELS, daysLeftText, formatPeriod, periodProgress } from "../../model/labels";
import type { MembershipCard } from "../../model/types";
import styles from "./MyAccount.module.css";

const IN_USE = new Set(["active", "ending_soon"]);

export function MembershipCardView({ card }: { card: MembershipCard }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const countsVisits = card.visitsLimit !== null;

  async function run(action: () => Promise<void>) {
    setPending(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof ClientApiError ? caught.message : "Щось пішло не так.");
    } finally {
      setPending(false);
    }
  }

  const toggleVisit = () =>
    run(async () =>
      replaceCard(await (card.visitedToday ? cancelVisitToday(card.id) : markVisitToday(card.id))),
    );

  const remove = () => {
    setConfirmingDelete(false);
    run(async () => {
      await deleteMembership(card.id);
      removeCard(card.id);
    });
  };

  return (
    <article className={styles.card} data-status={card.status}>
      <div className={styles.meta}>
        <Tag variant={IN_USE.has(card.status) ? "solid" : "muted"}>
          {STATUS_LABELS[card.status]}
        </Tag>
        <span className={styles.muted}>{card.gymName}</span>
      </div>

      <h3 className={styles.cardName}>{card.name}</h3>
      <p className={styles.detail}>
        <Icon name="event" size={16} />
        {formatPeriod(card.startsOn, card.endsOn)}
      </p>

      <div className={styles.progressBlock}>
        <div className={styles.progressRow}>
          <span>{daysLeftText(card)}</span>
          <span className={styles.muted}>{formatPrice(card.price)}</span>
        </div>
        <div
          className={styles.progress}
          role="progressbar"
          aria-label="Минуло днів"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(periodProgress(card) * 100)}
        >
          <span style={{ width: `${periodProgress(card) * 100}%` }} />
        </div>
      </div>

      {countsVisits && (
        <p className={styles.detail}>
          <Icon name="fitness_center" size={16} />
          Візити: {card.visitsUsed} з {card.visitsLimit}
        </p>
      )}

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <div className={styles.actions}>
        {countsVisits && (IN_USE.has(card.status) || card.visitedToday) && (
          <Button
            variant={card.visitedToday ? "outline" : "primary"}
            disabled={pending}
            onClick={toggleVisit}
          >
            <Icon name={card.visitedToday ? "close" : "check"} size={18} />
            {card.visitedToday ? "Скасувати сьогоднішній візит" : "Відмітити візит сьогодні"}
          </Button>
        )}
        <button
          type="button"
          className={styles.textLink}
          disabled={pending}
          onClick={() => setConfirmingDelete(true)}
        >
          Видалити
        </button>
      </div>
      <ConfirmDialog
        open={confirmingDelete}
        title={`Видалити «${card.name}»?`}
        message="Абонемент і відмічені візити зникнуть з кабінету назавжди."
        confirmLabel="Видалити"
        onConfirm={remove}
        onCancel={() => setConfirmingDelete(false)}
      />
    </article>
  );
}
