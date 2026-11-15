import { cx } from "@/shared/lib/classNames";
import { formatDateParts } from "@/shared/lib/format";
import { Icon, Tag } from "@/shared/ui";
import type { NewsItem } from "../../model/types";
import { NEWS_CATEGORIES } from "../categories";
import styles from "./NewsCard.module.css";

type NewsCardProps = {
  item: NewsItem;
  featured?: boolean;
};

export function NewsCard({ item, featured = false }: NewsCardProps) {
  const category = NEWS_CATEGORIES[item.category];
  const date = formatDateParts(item.date);

  return (
    <article className={cx(styles.card, featured && styles.featured)}>
      <time dateTime={item.date} className={styles.date}>
        <span className={styles.day}>{date.day}</span>
        <span className={styles.month}>{date.monthYear}</span>
      </time>

      <div className={styles.body}>
        <Tag variant={featured ? "solid" : "default"}>
          <Icon name={category.icon} size={14} />
          {category.label}
        </Tag>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.excerpt}>{item.excerpt}</p>
        <p className={styles.place}>
          <Icon name="location_on" size={16} />
          {item.place}
        </p>
      </div>
    </article>
  );
}
