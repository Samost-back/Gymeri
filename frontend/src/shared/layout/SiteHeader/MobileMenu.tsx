"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink, Icon } from "@/shared/ui";
import { NAV_LINKS, isNavLinkActive } from "./navLinks";
import styles from "./SiteHeader.module.css";

// Phones and tablets: the full nav doesn't fit next to the brand below 1024px.
export function MobileMenu() {
  const pathname = usePathname();
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

      {open && (
        <nav id="mobile-menu" className={styles.mobileNav} aria-label="Мобільна навігація">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isNavLinkActive(pathname, link.href) ? "page" : undefined}
              className={styles.mobileLink}
              onClick={close}
            >
              {link.label}
              <Icon name="arrow_forward" size={18} />
            </Link>
          ))}
          <ButtonLink href="/login" className={styles.mobileLogin} onClick={close}>
            <Icon name="login" size={18} />
            Увійти
          </ButtonLink>
        </nav>
      )}
    </>
  );
}
