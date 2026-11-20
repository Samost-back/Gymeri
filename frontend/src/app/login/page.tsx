import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/modules/accounts";
import { Icon, PhotoBackdrop } from "@/shared/ui";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Вхід · Gymeri",
  robots: { index: false },
};

// Direct visits and reloads of /login land here; site links open the modal instead.
export default function LoginPage() {
  return (
    <main className={styles.main}>
      <PhotoBackdrop focus="60% center" shade="even" />
      <div className={styles.panel}>
        {/* A link home, not "back": on a direct visit there may be no page to go back to. */}
        <Link href="/" className={styles.close} aria-label="Закрити">
          <Icon name="close" size={22} />
        </Link>
        <LoginForm />
      </div>
    </main>
  );
}
