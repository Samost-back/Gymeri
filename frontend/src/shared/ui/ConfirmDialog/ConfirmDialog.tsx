"use client";

import { useEffect, useId, useRef } from "react";
import { lockScroll } from "../../lib/scrollLock";
import { Button } from "../Button/Button";
import styles from "./ConfirmDialog.module.css";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Asks before an action that is hard to undo, in the site's own style instead of the
// browser's confirm(). Native <dialog> gives focus trapping, Escape and the backdrop.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Unique per dialog: a page can hold several, e.g. one per membership card.
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) {
      return;
    }
    dialog.showModal();
    const unlockScroll = lockScroll(document.documentElement);
    return () => {
      unlockScroll();
      dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={message ? messageId : undefined}
      className={styles.dialog}
      onCancel={(event) => {
        // Escape: let React decide, so the open prop and the dialog never disagree.
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        // A click on the dialog element itself lands on the backdrop, outside the panel.
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className={styles.panel}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {message && (
          <p id={messageId} className={styles.message}>
            {message}
          </p>
        )}
        <div className={styles.actions}>
          {/* Focused first, so Enter right after opening doesn't confirm by accident. */}
          <Button variant="outline" autoFocus onClick={onCancel}>
            Скасувати
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  );
}
