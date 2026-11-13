import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogHeader, GymSearchResults } from "@/modules/gyms";
import { Container } from "@/shared/ui";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Спортзали Луцька — пошук за районом і опціями · Gymeri",
};

export default function GymsPage({ searchParams }: PageProps<"/gyms">) {
  return (
    <main className={styles.main}>
      <Container>
        <CatalogHeader
          tag="Пошук залів"
          title="Зали за фільтрами"
          description="Конкретні локації з графіком, цінами та опціями. Змініть фільтри, щоб звузити вибір."
        />
        <Suspense>
          <GymSearchResults searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}
