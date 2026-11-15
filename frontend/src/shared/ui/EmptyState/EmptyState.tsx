import type { ReactNode } from "react";
import { Icon, type IconName } from "../Icon/Icon";
import { Tag } from "../Tag/Tag";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  icon: IconName;
  title: string;
  description: string;
  tag?: string;
  action?: ReactNode;
};

// Placeholder for sections whose backend is not built yet, so a tab never leads to a 404.
export function EmptyState({ icon, title, description, tag = "Скоро", action }: EmptyStateProps) {
  return (
    <section className={styles.panel}>
      <Icon name={icon} size={32} className={styles.icon} />
      <Tag variant="muted">{tag}</Tag>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action}
    </section>
  );
}
