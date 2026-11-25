import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountButton } from "@/modules/accounts";
import { GymSearchResults } from "@/modules/gyms";
import { PageHeader, PageHero, PageMain } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Мій кабінет — пошук залів і абонементи · Gymeri",
  description: "Пошук спортзалів Луцька за вулицею, опціями й графіком та відстеження абонемента.",
};

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <>
      <PageHero
        title="Мої абонементи"
        accent="під контролем."
        lead="Додайте абонементи своїх залів: кабінет рахуватиме дні й тренування, що лишились, і нагадає, коли час продовжити."
        action={<AccountButton />}
        photoFocus="30% center"
        compact
      />
      <PageMain>
        <section>
          <PageHeader
            title="Знайти зал"
            description="Конкретні локації з графіком, цінами та опціями. Змініть фільтри, щоб звузити вибір."
          />
          <Suspense>
            <GymSearchResults searchParams={searchParams} />
          </Suspense>
        </section>
      </PageMain>
    </>
  );
}
