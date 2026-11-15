import { Icon, type IconName, Tag } from "@/shared/ui";
import { AboutSection } from "../AboutSection/AboutSection";
import styles from "./Audiences.module.css";

type Audience = {
  icon: IconName;
  title: string;
  text: string;
  soon?: boolean;
};

const AUDIENCES: Audience[] = [
  {
    icon: "search",
    title: "Тим, хто тренується",
    text: "Знайти зал поруч, порівняти тарифи й не пропустити кінець абонемента.",
  },
  {
    icon: "domain",
    title: "Залам і мережам",
    text: "Сторінка мережі з адресами, тарифами й контактами, яку бачать люди, що шукають зал.",
  },
  {
    icon: "fitness_center",
    title: "Тренерам",
    text: "Профіль із напрямами й заявки від клієнтів.",
    soon: true,
  },
];

export function Audiences() {
  return (
    <AboutSection tag="03 / Для кого" title="Кому корисний Gymeri">
      <ul className={styles.list}>
        {AUDIENCES.map((audience) => (
          <li key={audience.title} className={styles.item}>
            <span className={styles.iconBox}>
              <Icon name={audience.icon} size={22} />
            </span>
            <div className={styles.body}>
              <h3 className={styles.title}>
                {audience.title}
                {audience.soon && <Tag variant="muted">Скоро</Tag>}
              </h3>
              <p className={styles.text}>{audience.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </AboutSection>
  );
}
