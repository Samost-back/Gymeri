"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ClientApiError } from "@/shared/lib/clientApi";
import { Button, Icon, Tag } from "@/shared/ui";
import { login, register } from "../../api/auth";
import { setSessionUser } from "../../model/session";
import styles from "./AuthForm.module.css";

const MODES = {
  login: {
    title: "Вхід у Gymeri",
    submit: "Увійти",
    send: login,
    passwordAutocomplete: "current-password",
    passwordHint: null,
    switchText: "Немає акаунта?",
    switchLink: { href: "/register", label: "Зареєструватися" },
  },
  register: {
    title: "Реєстрація в Gymeri",
    submit: "Створити акаунт",
    send: register,
    // Lets password managers offer a strong generated password.
    passwordAutocomplete: "new-password",
    passwordHint: "Від 8 символів, не лише цифри",
    switchText: "Вже є акаунт?",
    switchLink: { href: "/login", label: "Увійти" },
  },
} as const;

type AuthFormProps = { mode: keyof typeof MODES };

// Checks here only help typing; the backend decides what is valid.
function AuthForm({ mode }: AuthFormProps) {
  const config = MODES[mode];
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const user = await config.send({
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      setSessionUser(user);
      // replace: "back" from the account must not reopen a form the user already filled in.
      router.replace("/account");
    } catch (caught) {
      setError(caught instanceof ClientApiError ? caught.message : "Щось пішло не так.");
      setPending(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Tag variant="muted">Акаунт</Tag>
        <h2 className={styles.title}>{config.title}</h2>
        <p className={styles.subtitle}>Відстежуйте свої абонементи й залишок тренувань.</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
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
            {config.passwordHint && <span className={styles.hint}>{config.passwordHint}</span>}
          </span>
          <span className={styles.control}>
            <Icon name="lock" size={18} className={styles.controlIcon} />
            <input
              type="password"
              name="password"
              autoComplete={config.passwordAutocomplete}
              placeholder="••••••••"
              required
              minLength={mode === "register" ? 8 : undefined}
              maxLength={128}
              className={styles.input}
            />
          </span>
        </label>

        <Button type="submit" className={styles.submit} disabled={pending}>
          {config.submit}
          <Icon name="arrow_forward" size={18} />
        </Button>

        {error && (
          <p role="alert" className={styles.error}>
            <Icon name="error" size={18} />
            {error}
          </p>
        )}
      </form>

      <p className={styles.footer}>
        {config.switchText}{" "}
        <Link href={config.switchLink.href} replace className={styles.footerLink}>
          {config.switchLink.label}
        </Link>
      </p>
    </div>
  );
}

export function LoginForm() {
  return <AuthForm mode="login" />;
}

export function RegisterForm() {
  return <AuthForm mode="register" />;
}
