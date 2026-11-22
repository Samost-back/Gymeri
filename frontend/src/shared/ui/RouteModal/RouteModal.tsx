"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import { cx } from "../../lib/classNames";
import { lockScroll } from "../../lib/scrollLock";
import { Icon } from "../Icon/Icon";
import styles from "./RouteModal.module.css";

type RouteModalProps = {
  label: string;
  children: ReactNode;
  // Wide fills most of the screen, for content that needs room, like a map.
  size?: "default" | "wide";
  // Set on a direct visit, where "back" may lead off the site; closing goes here instead.
  closeHref?: string;
};

// Modal for an intercepted route: closing goes back, so the page underneath stays as it was.
// A page can also render it over its own content, closing to closeHref.
// Native <dialog> gives focus trapping, Escape and the backdrop for free.
export function RouteModal({ label, children, size = "default", closeHref }: RouteModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (!dialog.open) {
      dialog.showModal();
    }
    // Lock page scroll here, not in CSS: after router.back() Next.js keeps the dialog in the DOM
    // hidden, so a style keyed on it would keep the page frozen. Cleanup runs when it hides.
    const unlockScroll = lockScroll(document.documentElement);
    return () => {
      unlockScroll();
      dialog.close();
    };
  }, []);

  const close = () => (closeHref ? router.push(closeHref) : router.back());

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className={cx(styles.dialog, size === "wide" && styles.wide)}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        // A click on the dialog element itself lands on the backdrop, outside the panel.
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      <div className={styles.panel}>
        <button type="button" className={styles.close} aria-label="Закрити" onClick={close}>
          <Icon name="close" size={22} />
        </button>
        {children}
      </div>
    </dialog>
  );
}
