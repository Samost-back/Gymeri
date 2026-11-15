import { Icon } from "@/shared/ui";
import { AboutSection } from "../AboutSection/AboutSection";
import styles from "./Comparison.module.css";

const ROWS = [
  {
    before: "Гортати Instagram кожного залу в пошуках цін",
    after: "Ціни абонементів усіх залів на одній сторінці",
  },
  {
    before: "Дзвонити адміністратору, щоб дізнатися графік",
    after: "Графік роботи, адреса й опції в картці залу",
  },
  {
    before: "Їхати навмання, не знаючи, чи зал відкритий",
    after: "Позначка «Відкрито зараз» і фільтр 24/7",
  },
  {
    before: "Тримати в голові, коли закінчується абонемент",
    after: "Залишок днів і тренувань у кабінеті (скоро)",
  },
];

export function Comparison() {
  return (
    <AboutSection tag="01 / Навіщо" title="Як було і як стало">
      <div className={styles.table} role="table" aria-label="Як було і як стало">
        <div className={styles.head} role="row">
          <span role="columnheader">Зазвичай</span>
          <span role="columnheader">З Gymeri</span>
        </div>
        {ROWS.map((row) => (
          <div key={row.after} className={styles.row} role="row">
            <p className={styles.before} role="cell">
              <Icon name="close" size={18} />
              {row.before}
            </p>
            <p className={styles.after} role="cell">
              <Icon name="check" size={18} />
              {row.after}
            </p>
          </div>
        ))}
      </div>
    </AboutSection>
  );
}
