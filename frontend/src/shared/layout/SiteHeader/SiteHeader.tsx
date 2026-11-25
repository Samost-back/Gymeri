import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { Container, Icon } from "@/shared/ui";
import { MobileMenu } from "./MobileMenu";
import styles from "./SiteHeader.module.css";
import { NavLinks, SiteNav } from "./SiteNav";

type SiteHeaderProps = {
  // The sign-in control comes from the app: shared code knows nothing about accounts.
  account: ReactNode;
};

export function SiteHeader({ account }: SiteHeaderProps) {
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
          <div className={styles.login}>{account}</div>
          <MobileMenu account={account} />
        </div>
      </Container>
    </header>
  );
}
