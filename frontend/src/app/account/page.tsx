import type { Metadata } from "next";
import { Suspense } from "react";
import { CabinetSections, MembershipPreview } from "@/modules/accounts";
import { GymSearchResults } from "@/modules/gyms";
import { ButtonLink, Icon, PageHeader, PageHero, PageMain } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Мій кабінет — пошук залів і абонементи · Gymeri",
  description: "Пошук спортзалів Луцька за районом, опціями й графіком та відстеження абонемента.",
};

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <>
      <PageHero
        title="Мої абонементи"
        accent="під контролем."
        lead="Додайте абонементи своїх залів: кабінет рахуватиме дні й тренування, що лишились, і нагадає, коли час продовжити."
        action={
          <ButtonLink href="/login">
            <Icon name="login" size={18} />
            Увійти
          </ButtonLink>
        }
        photoFocus="30% center"
        aside={<MembershipPreview />}
        footer={<CabinetSections />}
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
