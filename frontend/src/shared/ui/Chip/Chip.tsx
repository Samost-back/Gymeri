import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "../../lib/classNames";
import { Icon, type IconName } from "../Icon/Icon";
import styles from "./Chip.module.css";

type ChipProps = {
  children: ReactNode;
  active?: boolean;
  icon?: IconName;
  // With href the chip navigates, so filters work without client-side JavaScript.
  href?: string;
};

export function Chip({ children, active = false, icon, href }: ChipProps) {
  const className = cx(styles.chip, active && styles.active);
  const content = (
    <>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-current={active ? "true" : undefined} className={className} scroll={false}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" aria-pressed={active} className={className}>
      {content}
    </button>
  );
}
