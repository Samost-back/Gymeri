import Link from "next/link";
import { Suspense } from "react";
import { ButtonLink, Container, Icon } from "@/shared/ui";
import { MobileMenu } from "./MobileMenu";
import styles from "./SiteHeader.module.css";
import { NavLinks, SiteNav } from "./SiteNav";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link href="/" className={styles.brand}>
          GYMERI · LUTSK
        </Link>

        <Suspense fallback={<NavLinks pathname={null} />}>
          <SiteNav />
        </Suspense>

        <div className={styles.actions}>
          <Link href="/map" className={styles.map}>
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
