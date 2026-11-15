import type { Metadata } from "next";
import { Suspense } from "react";
import { GymSearchResults } from "@/modules/gyms";
import { ButtonLink, Container, EmptyState, Icon, PageHeader } from "@/shared/ui";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Мій кабінет — пошук залів і абонементи · Gymeri",
  description: "Пошук спортзалів Луцька за районом, опціями й графіком та відстеження абонемента.",
};

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <main className={styles.main}>
      <Container className={styles.list}>
        <section>
          <PageHeader
            tag="Мій кабінет"
            title="Мої абонементи"
            description="Залишок днів і відвідувань, заморозка та нагадування про завершення абонемента."
          />
          <EmptyState
            icon="card_membership"
            title="Відстеження абонементів"
            description="Увійдіть, щоб додати абонемент свого залу й бачити, скільки днів і тренувань лишилось."
            action={
              <ButtonLink href="/login">
                <Icon name="login" size={18} />
                Увійти
              </ButtonLink>
            }
          />
        </section>

        <section>
          <PageHeader
            tag="Пошук залів"
            title="Знайти зал"
            description="Конкретні локації з графіком, цінами та опціями. Змініть фільтри, щоб звузити вибір."
          />
          <Suspense>
            <GymSearchResults searchParams={searchParams} />
          </Suspense>
        </section>
      </Container>
    </main>
  );
}
