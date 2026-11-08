import type { ReactNode } from "react";
import { Icon, type IconName } from "../Icon/Icon";
import styles from "./Chip.module.css";

type ChipProps = {
  children: ReactNode;
  active?: boolean;
  icon?: IconName;
};

export function Chip({ children, active = false, icon }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={[styles.chip, active && styles.active].filter(Boolean).join(" ")}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
}
