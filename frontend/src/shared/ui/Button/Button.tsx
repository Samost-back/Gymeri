import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "../../lib/classNames";
import styles from "./Button.module.css";

type Variant = "primary" | "outline" | "inverse";

function classes(variant: Variant, className?: string): string {
  return cx(styles.button, styles[variant], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant };

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={classes(variant, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant };

export function ButtonLink({ variant = "primary", className, ...props }: ButtonLinkProps) {
  return <Link className={classes(variant, className)} {...props} />;
}
