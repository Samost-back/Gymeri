import { Suspense } from "react";
import { CatalogHeader, ChainList, HomeFilters } from "@/modules/gyms";
import { Hero } from "@/modules/home";
import { Container } from "@/shared/ui";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <Hero />
      <main className={styles.main} id="catalog">
        <Container>
          <CatalogHeader
            tag="Реєстр локацій"
            title="Доступні клуби"
            description="Обирайте спортивний простір за спеціалізацією, обладнанням та тарифами. Фільтри відкривають список конкретних залів."
          />
          <Suspense>
            <HomeFilters />
          </Suspense>
          <Suspense>
            <ChainList />
          </Suspense>
        </Container>
      </main>
    </>
  );
}
