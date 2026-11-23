import { Tag } from "@/shared/ui";
import { AboutSection } from "../AboutSection/AboutSection";
import styles from "./Steps.module.css";

const STEPS = [
  {
    title: "Обери вулицю й опції",
    text: "Вулиця, тип залу, знижки: фільтри залишать лише те, що підходить.",
  },
  {
    title: "Порівняй зали",
    text: "Ціна «від», графік і опції стоять поруч, без переходів між сайтами.",
  },
  {
    title: "Тренуйся й відстежуй",
    text: "Додай абонемент у кабінет і бач, скільки днів і тренувань лишилось.",
    soon: true,
  },
];

export function Steps() {
  return (
    <AboutSection tag="02 / Як це працює" title="Три кроки до тренування">
      <ol className={styles.steps}>
        {STEPS.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
            <div className={styles.body}>
              <h3 className={styles.title}>
                {step.title}
                {step.soon && <Tag variant="muted">Скоро</Tag>}
              </h3>
              <p className={styles.text}>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </AboutSection>
  );
}
