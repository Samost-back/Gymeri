import type { ReactNode } from "react";
import { Container } from "../Container/Container";
import styles from "./PageHero.module.css";

type PageHeroProps = {
  status: string;
  title: string;
  accent: string;
  lead: string;
  // Right column on wide screens (a photo, a list); below the text on phones.
  aside?: ReactNode;
};

// Opening screen of secondary pages; the home page has its own photo hero.
export function PageHero({ status, title, accent, lead, aside }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      <Container className={styles.content}>
        <div>
          <span className={styles.status}>{status}</span>
          <h1 className={styles.title}>
            {title}
            <br />
            <span className={styles.titleAccent}>{accent}</span>
          </h1>
          <p className={styles.lead}>{lead}</p>
        </div>
        {aside}
      </Container>
    </section>
  );
}
