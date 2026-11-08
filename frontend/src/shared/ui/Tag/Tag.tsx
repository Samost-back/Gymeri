import type { ReactNode } from "react";
import styles from "./Tag.module.css";

type TagProps = {
  children: ReactNode;
  variant?: "default" | "muted" | "solid";
  className?: string;
};

export function Tag({ children, variant = "default", className }: TagProps) {
  return (
    <span className={[styles.tag, styles[variant], className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
