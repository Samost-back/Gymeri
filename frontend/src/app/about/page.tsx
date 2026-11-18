import type { Metadata } from "next";
import { AboutCta, AboutHero, Audiences, Comparison, Steps } from "@/modules/about";
import { PageMain } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Про сервіс · Gymeri",
  description: "Gymeri збирає спортзали Луцька в один каталог: адреси, графік, опції й ціни.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <PageMain spacing="sections">
        <Comparison />
        <Steps />
        <Audiences />
        <AboutCta />
      </PageMain>
    </>
  );
}
