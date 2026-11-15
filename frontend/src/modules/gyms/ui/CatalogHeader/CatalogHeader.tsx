import { Tag } from "@/shared/ui";
import styles from "./CatalogHeader.module.css";

type CatalogHeaderProps = {
  tag: string;
  title: string;
  description: string;
};

export function CatalogHeader({ tag, title, description }: CatalogHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <Tag variant="muted" className={styles.tag}>
          {tag}
        </Tag>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <p className={styles.description}>{description}</p>
    </header>
  );
}
