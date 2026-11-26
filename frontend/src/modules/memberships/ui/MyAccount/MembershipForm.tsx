"use client";

import { type FormEvent, useState } from "react";
import { ClientApiError } from "@/shared/lib/clientApi";
import { formatPrice } from "@/shared/lib/format";
import { Button } from "@/shared/ui";
import { addMembership, getAccount } from "../../api/memberships";
import { accountStore } from "../../model/accountState";
import { todayIso } from "../../model/labels";
import type { GymPlan } from "../../model/types";
import styles from "./MyAccount.module.css";

type Fields = {
  name: string;
  price: string;
  durationDays: string;
  // Empty means unlimited visits.
  visitsLimit: string;
  startsOn: string;
};

function fieldsFrom(plan: GymPlan | undefined, startsOn: string): Fields {
  return {
    name: plan?.name ?? "",
    price: plan ? String(plan.price) : "",
    durationDays: plan ? String(plan.durationDays) : "30",
    visitsLimit: plan?.visitsLimit ? String(plan.visitsLimit) : "",
    startsOn,
  };
}

type MembershipFormProps = { plans: GymPlan[]; onDone: () => void };

// Prefilled from a plan of the chosen gym, then editable: what a client bought may differ
// from the price list. The backend checks every value.
export function MembershipForm({ plans, onDone }: MembershipFormProps) {
  const [planIndex, setPlanIndex] = useState(plans.length > 0 ? "0" : "custom");
  const [fields, setFields] = useState(() => fieldsFrom(plans[0], todayIso()));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const update = (name: keyof Fields) => (event: { target: { value: string } }) =>
    setFields({ ...fields, [name]: event.target.value });

  function pickPlan(value: string) {
    setPlanIndex(value);
    setFields(fieldsFrom(value === "custom" ? undefined : plans[Number(value)], fields.startsOn));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await addMembership({
        name: fields.name,
        price: Number(fields.price),
        durationDays: Number(fields.durationDays),
        visitsLimit: fields.visitsLimit ? Number(fields.visitsLimit) : null,
        startsOn: fields.startsOn,
      });
      // Saved: the form closes now, even if the reload below fails, so a second tap can't add it
      // twice. Reloaded rather than inserted, so it lands where the backend's order puts it.
      onDone();
      getAccount()
        .then(accountStore.set)
        .catch(() => undefined);
    } catch (caught) {
      setError(caught instanceof ClientApiError ? caught.message : "Щось пішло не так.");
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span className={styles.label}>Тип абонемента</span>
        <select
          value={planIndex}
          onChange={(event) => pickPlan(event.target.value)}
          className={styles.input}
        >
          {plans.map((plan, index) => (
            <option key={plan.name} value={index}>
              {plan.name} — {formatPrice(plan.price)}
              {plan.audiences.length > 0 && ` (${plan.audiences.join(", ").toLowerCase()})`}
            </option>
          ))}
          <option value="custom">Свій варіант</option>
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Назва</span>
        <input
          value={fields.name}
          onChange={update("name")}
          required
          maxLength={100}
          className={styles.input}
        />
      </label>

      <div className={styles.fieldRow}>
        <label className={styles.field}>
          <span className={styles.label}>Дата отримання</span>
          <input
            type="date"
            value={fields.startsOn}
            onChange={update("startsOn")}
            required
            className={styles.input}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Днів дії</span>
          <input
            type="number"
            min={1}
            value={fields.durationDays}
            onChange={update("durationDays")}
            required
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.fieldRow}>
        <label className={styles.field}>
          <span className={styles.label}>Візитів</span>
          <input
            type="number"
            min={1}
            value={fields.visitsLimit}
            onChange={update("visitsLimit")}
            placeholder="Без обмеження"
            className={styles.input}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Ціна, грн</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={fields.price}
            onChange={update("price")}
            required
            className={styles.input}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <div className={styles.formActions}>
        <Button type="submit" disabled={pending}>
          Зберегти
        </Button>
        <Button variant="outline" onClick={onDone}>
          Скасувати
        </Button>
      </div>
    </form>
  );
}
