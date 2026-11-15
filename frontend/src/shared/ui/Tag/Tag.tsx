import type { ReactNode } from "react";
import { cx } from "../../lib/classNames";
import styles from "./Tag.module.css";

type TagProps = {
  children: ReactNode;
  variant?: "default" | "muted" | "solid";
  className?: string;
};

export function Tag({ children, variant = "default", className }: TagProps) {
  return (
    <span className={cx(styles.tag, styles[variant], className)}>
      {children}
    </span>
  );
}
