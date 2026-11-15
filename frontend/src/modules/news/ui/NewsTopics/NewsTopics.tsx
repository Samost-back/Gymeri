import { Icon } from "@/shared/ui";
import { NEWS_CATEGORIES } from "../categories";
import styles from "./NewsTopics.module.css";

export function NewsTopics() {
  return (
    <ul className={styles.topics} aria-label="Теми стрічки">
      {Object.values(NEWS_CATEGORIES).map((category) => (
        <li key={category.topic} className={styles.topic}>
          <span className={styles.iconBox}>
            <Icon name={category.icon} size={22} />
          </span>
          <span>
            <span className={styles.label}>{category.topic}</span>
            <span className={styles.hint}>{category.hint}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
