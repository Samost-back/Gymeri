import type { Metadata } from "next";
import { Suspense } from "react";
import { GymSearchResults } from "@/modules/gyms";
import {
  AccountAction,
  ChooseGymButton,
  MyAccount,
  UntilGymChosen,
} from "@/modules/memberships";
import { PageHeader, PageHero, PageMain } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Мій кабінет — пошук залів і абонементи · Gymeri",
  description: "Пошук спортзалів Луцька за вулицею, опціями й графіком та відстеження абонемента.",
};

export default function AccountPage({ searchParams }: PageProps<"/account">) {
  return (
    <>
      <UntilGymChosen>
        <PageHero
          title="Мої абонементи"
          accent="під контролем."
          lead="Додайте абонементи своїх залів: кабінет рахуватиме дні й тренування, що лишились, і покаже, коли час продовжити."
          action={<AccountAction />}
          photoFocus="30% center"
          compact
        />
      </UntilGymChosen>
      <PageMain spacing="sections">
        <MyAccount />
        <section id="find-gym">
          <PageHeader
            title="Знайти зал"
            description="Конкретні локації з графіком, цінами та опціями. Змініть фільтри, щоб звузити вибір."
          />
          <Suspense>
            <GymSearchResults
              searchParams={searchParams}
              cardAction={(gymSlug) => <ChooseGymButton gymSlug={gymSlug} />}
            />
          </Suspense>
        </section>
      </PageMain>
    </>
  );
}
