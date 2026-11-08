import { Tag } from "@/shared/ui";
import styles from "./CatalogHeader.module.css";

export function CatalogHeader() {
  return (
    <header className={styles.header}>
      <div>
        <Tag variant="muted" className={styles.tag}>
          Реєстр локацій
        </Tag>
        <h2 className={styles.title}>Доступні клуби</h2>
      </div>
      <p className={styles.description}>
        Обирайте спортивний простір за спеціалізацією, обладнанням та тарифами разового
        відвідування.
      </p>
    </header>
  );
}
