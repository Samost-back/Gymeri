import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, PhotoBackdrop } from "@/shared/ui";
import styles from "./AuthPage.module.css";

// Full page for direct visits and reloads of /login and /register; site links open the
// same form in a modal instead.
export function AuthPage({ children }: { children: ReactNode }) {
  return (
    <main className={styles.main}>
      <PhotoBackdrop focus="60% center" shade="even" />
      <div className={styles.panel}>
        {/* A link home, not "back": on a direct visit there may be no page to go back to. */}
        <Link href="/" className={styles.close} aria-label="Закрити">
          <Icon name="close" size={22} />
        </Link>
        {children}
      </div>
    </main>
  );
}
