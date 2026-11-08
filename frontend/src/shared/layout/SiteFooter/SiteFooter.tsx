import Link from "next/link";
import { Container } from "@/shared/ui";
import styles from "./SiteFooter.module.css";

const FOOTER_LINKS = [
  { href: "/contacts", label: "Контакти" },
  { href: "/terms", label: "Умови використання" },
  { href: "/privacy", label: "Політика конфіденційності" },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.name}>GYMERI · LUTSK</span>
          <span className={styles.copyright}>© 2026 Gymeri. Усі права захищені.</span>
        </div>

        <nav className={styles.links} aria-label="Додаткові посилання">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
