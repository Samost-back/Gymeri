"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import { Icon } from "../Icon/Icon";
import styles from "./RouteModal.module.css";

type RouteModalProps = {
  label: string;
  children: ReactNode;
};

// Modal for an intercepted route: closing goes back, so the page underneath stays as it was.
// Native <dialog> gives focus trapping, Escape and the backdrop for free.
export function RouteModal({ label, children }: RouteModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  const close = () => router.back();

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className={styles.dialog}
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
