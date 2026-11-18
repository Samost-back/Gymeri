import { Icon, type IconName, Tag } from "@/shared/ui";
import { cx } from "@/shared/lib/classNames";
import styles from "./CabinetSections.module.css";

type Section = {
  icon: IconName;
  label: string;
  soon: boolean;
};

// Memberships come in the first version; the rest are announced so the cabinet's scope is clear.
const SECTIONS: Section[] = [
  { icon: "card_membership", label: "Абонементи", soon: false },
  { icon: "fitness_center", label: "Тренування", soon: true },
  { icon: "sports", label: "Тренери", soon: true },
  { icon: "person", label: "Профіль", soon: true },
];

export function CabinetSections() {
  return (
    <ul className={styles.sections} aria-label="Розділи кабінету">
      {SECTIONS.map((section) => (
        <li key={section.label} className={cx(styles.section, !section.soon && styles.current)}>
          <Icon name={section.icon} size={20} />
          <span className={styles.label}>{section.label}</span>
          {section.soon && <Tag variant="muted">Скоро</Tag>}
        </li>
      ))}
    </ul>
  );
}
