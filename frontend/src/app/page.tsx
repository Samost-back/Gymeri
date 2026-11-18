import { Suspense } from "react";
import { ChainList } from "@/modules/gyms";
import { Hero } from "@/modules/home";
import { PageHeader, PageMain } from "@/shared/ui";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PageMain id="catalog">
        <PageHeader title="Доступні клуби" />
        <Suspense>
          <ChainList />
        </Suspense>
      </PageMain>
    </>
  );
}
