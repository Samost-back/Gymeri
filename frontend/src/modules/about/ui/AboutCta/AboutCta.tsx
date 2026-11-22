import { ButtonLink, Icon } from "@/shared/ui";
import styles from "./AboutCta.module.css";

// Closing block with one clear next step; dark, so it doesn't glare after the page.
export function AboutCta() {
  return (
    <section className={styles.cta}>
      <div>
        <h2 className={styles.title}>Знайди свій зал</h2>
        <p className={styles.text}>Вулиця, опції, графік і ціни. Займе хвилину.</p>
      </div>
      <ButtonLink href="/account" className={styles.button}>
        Перейти до пошуку
        <Icon name="arrow_forward" size={18} />
      </ButtonLink>
    </section>
  );
}
