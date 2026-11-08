import Image from "next/image";
import type { CatalogStats } from "@/modules/gyms";
import { pluralize } from "@/shared/lib/format";
import { Container } from "@/shared/ui";
import heroImage from "../../assets/hero.webp";
import styles from "./Hero.module.css";

type HeroProps = {
  stats: CatalogStats;
};

export function Hero({ stats }: HeroProps) {
  const statItems = [
    { label: "Актуальний каталог", value: pluralize(stats.gyms, { one: "зал", few: "зали", many: "залів" }) },
    { label: "Локаційна мережа", value: pluralize(stats.chains, { one: "бренд", few: "бренди", many: "брендів" }) },
    { label: "Охоплення", value: pluralize(stats.districts, { one: "район", few: "райони", many: "районів" }) },
  ];

  return (
    <section className={styles.hero}>
      <div className={styles.background} aria-hidden="true">
        <Image
          src={heroImage}
          alt=""
          fill
          preload
          placeholder="blur"
          sizes="100vw"
          className={styles.image}
        />
        <div className={styles.fadeBottom} />
        <div className={styles.fadeSides} />
        <div className={styles.shimmer} />
      </div>

      <Container className={styles.content}>
        <div className={styles.status}>
          <span className={styles.pulse} aria-hidden="true" />
          <span className={styles.statusText}>Gymeri // Луцьк • Сезон 2026</span>
        </div>

        <h1 className={styles.title}>
          Спортзали Луцька.
          <br />
          <span className={styles.titleAccent}>Твоє тренувальне місто.</span>
        </h1>

        <p className={styles.subtitle}>
          Прямий доступ до найкращих тренувальних локацій міста. Актуальні тарифи, розклад та
          абонементи в єдиному каталозі без посередників.
        </p>

        <dl className={styles.stats}>
          {statItems.map((item) => (
            <div key={item.label} className={styles.stat}>
              <dt className={styles.statLabel}>{item.label}</dt>
              <dd className={styles.statValue}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
