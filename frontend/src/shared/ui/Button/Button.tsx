import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "../../lib/classNames";
import styles from "./Button.module.css";

type Variant = "primary" | "outline";

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

type ButtonAnchorProps = ComponentProps<"a"> & { variant?: Variant };

// A plain link for jumps within the page (href="#..."). Next's Link ignores a click whose URL,
// hash included, is already the current one, so a second jump to the same place did nothing.
export function ButtonAnchor({ variant = "primary", className, ...props }: ButtonAnchorProps) {
  return <a className={classes(variant, className)} {...props} />;
}
