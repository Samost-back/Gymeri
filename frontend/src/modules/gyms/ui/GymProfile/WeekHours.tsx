import { cx } from "@/shared/lib/classNames";
import type { DayHours } from "../../model/types";
import styles from "./GymProfile.module.css";

export function WeekHours({ week }: { week: DayHours[] }) {
  if (week.every((day) => day.hours === null)) {
    return <p className={styles.empty}>Зал ще не додав графік роботи.</p>;
  }

  return (
    <ul className={styles.week} aria-label="Графік роботи по днях">
      {week.map((day) => (
        <li
          key={day.name}
          className={cx(styles.day, day.isToday && styles.today)}
          aria-current={day.isToday ? "date" : undefined}
        >
          <span className={styles.dayName}>{day.name}</span>
          <span>{day.hours ?? "вихідний"}</span>
        </li>
      ))}
    </ul>
  );
}
