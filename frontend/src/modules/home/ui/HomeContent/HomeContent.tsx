import { Suspense } from "react";
import { ChainList } from "@/modules/gyms";
import { PageHeader, PageMain } from "@/shared/ui";
import { Hero } from "../Hero/Hero";

// The home page body; /map also renders it under the map on a direct visit.
export function HomeContent() {
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
