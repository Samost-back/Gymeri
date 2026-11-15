import { Suspense } from "react";
import { ChainList } from "@/modules/gyms";
import { Hero } from "@/modules/home";
import { Container, PageHeader } from "@/shared/ui";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <Hero />
      <main className={styles.main} id="catalog">
        <Container>
          <PageHeader
            tag="Реєстр локацій"
            title="Доступні клуби"
          />
          <Suspense>
            <ChainList />
          </Suspense>
        </Container>
      </main>
    </>
  );
}
