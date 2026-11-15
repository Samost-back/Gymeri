"use client";

import { useState } from "react";
import { Button, Icon, Tag } from "@/shared/ui";
import styles from "./LoginForm.module.css";

// Layout only: the accounts API doesn't exist yet, so submitting just says so.
export function LoginForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Tag variant="muted">Акаунт</Tag>
        <h2 className={styles.title}>Вхід у Gymeri</h2>
        <p className={styles.subtitle}>Відстежуйте свої абонементи й залишок тренувань.</p>
      </header>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <label className={styles.field}>
          <span className={styles.label}>Email</span>
          <span className={styles.control}>
            <Icon name="mail" size={18} className={styles.controlIcon} />
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              className={styles.input}
            />
          </span>
        </label>

        <label className={styles.field}>
          <span className={styles.labelRow}>
            <span className={styles.label}>Пароль</span>
            <span className={styles.hint}>Забули пароль?</span>
          </span>
          <span className={styles.control}>
            <Icon name="lock" size={18} className={styles.controlIcon} />
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className={styles.input}
            />
          </span>
        </label>

        <Button type="submit" className={styles.submit}>
          Увійти
          <Icon name="arrow_forward" size={18} />
        </Button>

        {submitted && (
          <p role="status" className={styles.notice}>
            <Icon name="info" size={18} />
            Вхід ще в розробці. Каталог і пошук залів уже доступні без акаунта.
          </p>
        )}
      </form>

      <p className={styles.footer}>
        Немає акаунта? <span className={styles.footerSoon}>Реєстрація незабаром</span>
      </p>
    </div>
  );
}
