import Image from "next/image";
import { Suspense } from "react";
import { ButtonLink, Container, Icon } from "@/shared/ui";
import heroImage from "../../assets/hero.webp";
import styles from "./Hero.module.css";
import { HeroStats, HeroStatsList } from "./HeroStats";

export function Hero() {
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

        <div className={styles.statsRow}>
          <Suspense fallback={<HeroStatsList />}>
            <HeroStats />
          </Suspense>
          <ButtonLink href="/account" className={styles.cta}>
            Знайти зал
            <Icon name="arrow_forward" size={18} />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
