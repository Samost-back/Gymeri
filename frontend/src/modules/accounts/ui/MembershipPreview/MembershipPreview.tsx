import { Icon, Tag } from "@/shared/ui";
import styles from "./MembershipPreview.module.css";

type SampleMembership = {
  gym: string;
  plan: string;
  daysLeft: number;
  totalDays: number;
  validUntil: string;
};

// Made-up progress on real plans from the demo catalog: guests see what the cabinet will
// look like before they log in, and the plans match what the catalog lists.
const SAMPLES: SampleMembership[] = [
  {
    gym: "Інтер Атлетика · Конякіна",
    plan: "Повний безліміт на місяць у всі зали",
    daysLeft: 18,
    totalDays: 30,
    validUntil: "до 6 грудня",
  },
  {
    gym: "Lime Fit Club · Центр",
    plan: "Ранковий абонемент на місяць",
    daysLeft: 9,
    totalDays: 30,
    validUntil: "до 27 листопада",
  },
];

export function MembershipPreview() {
  return (
    <div className={styles.preview}>
      <p className={styles.caption}>
        <Icon name="lock" size={14} />
        Так виглядатиме ваш кабінет
      </p>
      <ul className={styles.cards} aria-label="Приклад абонементів">
        {SAMPLES.map((sample) => (
          <li key={sample.gym} className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.gym}>{sample.gym}</span>
              <Tag variant="muted">Приклад</Tag>
            </div>
            <p className={styles.plan}>{sample.plan}</p>
            <div className={styles.counter}>
              <span>Днів лишилось</span>
              <span className={styles.value}>
                {sample.daysLeft} / {sample.totalDays}
              </span>
            </div>
            {/* The numbers above already say it, so the bar is decoration for screen readers. */}
            <div className={styles.bar} aria-hidden="true">
              <div
                className={styles.fill}
                style={{ width: `${(sample.daysLeft / sample.totalDays) * 100}%` }}
              />
            </div>
            <p className={styles.until}>{sample.validUntil}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
