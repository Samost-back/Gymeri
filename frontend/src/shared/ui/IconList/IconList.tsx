import type { ReactNode } from "react";
import { Icon, type IconName } from "../Icon/Icon";
import styles from "./IconList.module.css";

export type IconListItem = {
  icon: IconName;
  title: string;
  hint: string;
  badge?: ReactNode;
};

type IconListProps = {
  items: IconListItem[];
  label: string;
};

// Side list of the inner-page banners: icon, title and hint, optionally a badge on the right.
export function IconList({ items, label }: IconListProps) {
  return (
    <ul className={styles.list} aria-label={label}>
      {items.map((item) => (
        <li key={item.title} className={styles.item}>
          <span className={styles.iconBox}>
            <Icon name={item.icon} size={22} />
          </span>
          <span className={styles.text}>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.hint}>{item.hint}</span>
          </span>
          {item.badge}
        </li>
      ))}
    </ul>
  );
}
