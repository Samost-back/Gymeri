"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isNavLinkActive } from "./navLinks";
import styles from "./SiteHeader.module.css";

// A client component only because the active tab depends on the current URL.
export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Головна навігація">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isNavLinkActive(pathname, link.href) ? "page" : undefined}
          className={styles.navLink}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
