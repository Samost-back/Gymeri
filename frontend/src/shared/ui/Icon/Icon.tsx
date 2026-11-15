import { cx } from "../../lib/classNames";
import styles from "./Icon.module.css";

// Only these glyphs are downloaded from the icon font, see iconFontUrl.
const ICON_NAMES = [
  "check",
  "domain",
  "expand_more",
  "fitness_center",
  "location_on",
  "map",
  "pin_drop",
  "pool",
  "schedule",
  "star",
  "timer",
  "tune",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

// Google Fonts requires icon_names to be sorted alphabetically.
export const iconFontUrl =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" +
  `&icon_names=${[...ICON_NAMES].sort().join(",")}&display=block`;

type IconProps = {
  name: IconName;
  size?: number;
  filled?: boolean;
  className?: string;
};

export function Icon({ name, size = 18, filled = false, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(styles.icon, filled && styles.filled, className)}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  );
}
