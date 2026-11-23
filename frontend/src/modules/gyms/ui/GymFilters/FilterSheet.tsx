"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cx } from "@/shared/lib/classNames";
import { pluralize } from "@/shared/lib/format";
import { lockScroll } from "@/shared/lib/scrollLock";
import { Icon } from "@/shared/ui";
import styles from "./GymFilters.module.css";

// Same breakpoint as the inline layout in GymFilters.module.css.
const INLINE_FILTERS_QUERY = "(min-width: 1024px)";
const FOCUSABLE = "a[href], button:not([disabled]), select";

type FilterSheetProps = {
  activeCount: number;
  resultCount: number | null;
  resetHref: string;
  children: ReactNode;
};

// Wide screens show the filters inline. Phones and tablets get one "Filters" button that opens
// them in a sheet from the bottom: each choice applies at once, so the result count on the
// "show" button stays true.
export function FilterSheet({ activeCount, resultCount, resetHref, children }: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    // A div, not a native <dialog>: on wide screens the same element is shown inline, which a
    // dialog can't do. So focus is moved, kept inside and given back here by hand.
    closeButtonRef.current?.focus();
    const openButton = openButtonRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (event.key !== "Tab" || !focusable?.length) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    // Widening the window to the inline layout would otherwise leave the page scroll locked.
    const wide = window.matchMedia(INLINE_FILTERS_QUERY);
    const closeWhenWide = () => {
      if (wide.matches) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", closeWhenWide);
    const unlockScroll = lockScroll(document.documentElement);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", closeWhenWide);
      unlockScroll();
      openButton?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        className={styles.openButton}
        aria-expanded={open}
        aria-controls="gym-filters"
        onClick={() => setOpen(true)}
      >
        <Icon name="tune" size={18} />
        Фільтри
        {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
      </button>

      {/* The dimmed page above the sheet; a tap on it closes the sheet, like a native one. */}
      {open && <div className={styles.backdrop} aria-hidden="true" onClick={() => setOpen(false)} />}

      <div
        ref={sheetRef}
        id="gym-filters"
        className={cx(styles.sheet, open && styles.sheetOpen)}
        role={open ? "dialog" : undefined}
        aria-modal={open || undefined}
        aria-label="Фільтри залів"
      >
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>Фільтри</span>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.sheetClose}
            aria-label="Закрити фільтри"
            onClick={() => setOpen(false)}
          >
            <Icon name="close" size={22} />
          </button>
        </div>

        <div className={styles.sheetBody}>{children}</div>

        <div className={styles.sheetFooter}>
          {activeCount > 0 && (
            <Link href={resetHref} className={styles.sheetReset} scroll={false}>
              Скинути
            </Link>
          )}
          <button type="button" className={styles.showButton} onClick={() => setOpen(false)}>
            {resultCount === null
              ? "Закрити"
              : `Показати ${pluralize(resultCount, { one: "зал", few: "зали", many: "залів" })}`}
          </button>
        </div>
      </div>
    </>
  );
}
