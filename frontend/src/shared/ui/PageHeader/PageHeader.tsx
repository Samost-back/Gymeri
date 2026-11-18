import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h2 className={styles.title}>{title}</h2>
      </div>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  );
}
