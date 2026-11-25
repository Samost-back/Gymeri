"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { Icon } from "@/shared/ui";
import { NAV_LINKS, isNavLinkActive } from "./navLinks";
import styles from "./SiteHeader.module.css";

// Phones and tablets: the full nav doesn't fit next to the brand below 1024px.
export function MobileMenu({ account }: { account: ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Закрити меню" : "Відкрити меню"}
        onClick={() => setOpen(!open)}
      >
        <Icon name={open ? "close" : "menu"} size={24} />
      </button>

      {open && <MobileNav account={account} onClose={close} />}
    </>
  );
}

// Reads the URL only once the menu is open, so the closed button never waits for it on
// dynamic routes, where the pathname is known only at request time.
function MobileNav({ account, onClose }: { account: ReactNode; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <nav id="mobile-menu" className={styles.mobileNav} aria-label="Мобільна навігація">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isNavLinkActive(pathname, link.href) ? "page" : undefined}
          className={styles.mobileLink}
          onClick={onClose}
        >
          {link.label}
          <Icon name="arrow_forward" size={18} />
        </Link>
      ))}
      <div className={styles.mobileActions}>
        <Link href="/map" className={styles.mobileMap} onClick={onClose}>
          <Icon name="location_on" size={18} />
          Карта
        </Link>
        {/* Any click on the sign-in control (a link or "Вийти") is done with the menu. */}
        <div className={styles.mobileLogin} onClick={onClose}>
          {account}
        </div>
      </div>
    </nav>
  );
}
