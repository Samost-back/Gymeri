import type { Metadata } from "next";
import { AboutCta, AboutHero, Audiences, CatalogNumbers, Comparison, Steps } from "@/modules/about";
import { Container } from "@/shared/ui";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Про сервіс · Gymeri",
  description: "Gymeri збирає спортзали Луцька в один каталог: адреси, графік, опції й ціни.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <main className={styles.main}>
        <Container className={styles.sections}>
          <CatalogNumbers />
          <Comparison />
          <Steps />
          <Audiences />
          <AboutCta />
        </Container>
      </main>
    </>
  );
}
