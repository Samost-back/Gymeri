import Link from "next/link";
import { ButtonLink, Container, Icon } from "@/shared/ui";
import styles from "./SiteHeader.module.css";

const NAV_LINKS = [
  { href: "/", label: "Зали", active: true },
  { href: "/memberships", label: "Абонементи", active: false },
  { href: "/about", label: "Про сервіс", active: false },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link href="/" className={styles.brand}>
          GYMERI · LUTSK
          <span className={styles.badge}>Beta</span>
        </Link>

        <nav className={styles.nav} aria-label="Головна навігація">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className={styles.navLink}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href="/#catalog" className={styles.mapLink}>
            <Icon name="location_on" size={16} />
            Карта
          </Link>
          <ButtonLink href="/login" className={styles.login}>
            Увійти
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}
