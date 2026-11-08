import { Chip, Icon, type IconName } from "@/shared/ui";
import styles from "./GymFilters.module.css";

const DISTRICTS = ["Всі райони", "Центр", "Соборності / 33-й", "Перемоги", "Відродження"];

const FEATURES: { label: string; icon: IconName }[] = [
  { label: "Силовий зал", icon: "fitness_center" },
  { label: "Кросфіт зона", icon: "timer" },
  { label: "Басейн / СПА", icon: "pool" },
  { label: "24/7 режим", icon: "schedule" },
];

// Static for now: filtering happens on the backend once the search API exists.
export function GymFilters() {
  return (
    <section className={styles.panel} aria-label="Фільтри залів">
      <div className={styles.topRow}>
        <div className={styles.heading}>
          <Icon name="tune" size={16} className={styles.headingIcon} />
          Фільтрація та параметри відбору
        </div>

        <div className={styles.sort}>
          <label htmlFor="gym-sort" className={styles.sortLabel}>
            Сортування:
          </label>
          <div className={styles.selectWrap}>
            <select id="gym-sort" className={styles.select} defaultValue="name">
              <option value="name">За назвою</option>
              <option value="price">Спочатку дешевші</option>
              <option value="locations">За кількістю локацій</option>
            </select>
            <Icon name="expand_more" size={16} className={styles.selectIcon} />
          </div>
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>[Район]</span>
        <div className={styles.chips}>
          {DISTRICTS.map((district, index) => (
            <Chip key={district} active={index === 0}>
              {district}
            </Chip>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>[Опції]</span>
        <div className={styles.chips}>
          {FEATURES.map((feature) => (
            <Chip key={feature.label} icon={feature.icon}>
              {feature.label}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  );
}
