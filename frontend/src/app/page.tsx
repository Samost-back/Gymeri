import { CatalogHeader, GymCard, GymFilters, getCatalogStats, getGyms } from "@/modules/gyms";
import { Hero } from "@/modules/home";
import { Container } from "@/shared/ui";
import styles from "./page.module.css";

export default async function HomePage() {
  const [gyms, stats] = await Promise.all([getGyms(), getCatalogStats()]);

  return (
    <>
      <Hero stats={stats} />
      <main className={styles.main} id="catalog">
        <Container>
          <CatalogHeader />
          <GymFilters />
          <div className={styles.list}>
            {gyms.map((gym, index) => (
              <GymCard key={gym.slug} gym={gym} position={index + 1} />
            ))}
          </div>
        </Container>
      </main>
    </>
  );
}
