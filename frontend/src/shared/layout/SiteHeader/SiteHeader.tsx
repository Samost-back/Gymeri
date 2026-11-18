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
        </Link>

        <SiteNav />

        <div className={styles.actions}>
          {/* Plain text, not a link, until the map page exists. */}
          <span className={styles.mapSoon}>
            <Icon name="location_on" size={16} />
            Карта
          </span>
          <ButtonLink href="/login" className={styles.login}>
            Увійти
          </ButtonLink>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
