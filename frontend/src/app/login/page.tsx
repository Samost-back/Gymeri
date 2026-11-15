import type { Metadata } from "next";
import { LoginForm } from "@/modules/accounts";
import { Container } from "@/shared/ui";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Вхід · Gymeri",
  robots: { index: false },
};

// Direct visits and reloads of /login land here; site links open the modal instead.
export default function LoginPage() {
  return (
    <main className={styles.main}>
      <Container className={styles.narrow}>
        <LoginForm />
      </Container>
    </main>
  );
}
