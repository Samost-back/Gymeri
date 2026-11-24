"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isNavLinkActive } from "./navLinks";
import styles from "./SiteHeader.module.css";

// A client component only because the active tab depends on the current URL.
export function SiteNav() {
  return <NavLinks pathname={usePathname()} />;
}

// With no pathname no tab is marked: the header shows this while the URL of a dynamic
// route (e.g. a gym page) is still unknown, since that is only known at request time.
export function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav className={styles.nav} aria-label="Головна навігація">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={
            pathname !== null && isNavLinkActive(pathname, link.href) ? "page" : undefined
          }
          className={styles.navLink}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
