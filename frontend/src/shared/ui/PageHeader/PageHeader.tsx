import { Tag } from "../Tag/Tag";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  tag: string;
  title: string;
  description?: string;
};

export function PageHeader({ tag, title, description }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <Tag variant="muted" className={styles.tag}>
          {tag}
        </Tag>
        <h2 className={styles.title}>{title}</h2>
      </div>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  );
}
