import Link from "next/link";
import { ButtonLink, Container, Icon } from "@/shared/ui";
import { MobileMenu } from "./MobileMenu";
import styles from "./SiteHeader.module.css";
import { SiteNav } from "./SiteNav";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link href="/" className={styles.brand}>
          GYMERI · LUTSK
          <span className={styles.badge}>Beta</span>
        </Link>

        <SiteNav />

        <div className={styles.actions}>
          <Link href="/#catalog" className={styles.mapLink}>
            <Icon name="location_on" size={16} />
            Карта
          </Link>
          <ButtonLink href="/login" className={styles.login}>
            Увійти
          </ButtonLink>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
