import { ButtonLink, Icon } from "@/shared/ui";
import styles from "./AboutCta.module.css";

// Inverted block closes the page with one clear next step.
export function AboutCta() {
  return (
    <section className={styles.cta}>
      <div>
        <h2 className={styles.title}>Знайди свій зал</h2>
        <p className={styles.text}>Район, опції, графік і ціни. Займе хвилину.</p>
      </div>
      <ButtonLink href="/account" variant="inverse" className={styles.button}>
        Перейти до пошуку
        <Icon name="arrow_forward" size={18} />
      </ButtonLink>
    </section>
  );
}
