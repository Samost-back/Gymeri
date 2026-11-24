import type { Metadata } from "next";
import { Suspense } from "react";
import { GymProfile, getGym } from "@/modules/gyms";

export async function generateMetadata({ params }: PageProps<"/gyms/[slug]">): Promise<Metadata> {
  const gym = await getGym((await params).slug);
  if (!gym) {
    return { title: "Зал не знайдено · Gymeri" };
  }
  return {
    title: `${gym.name} — абонементи, графік, адреса · Gymeri`,
    description: `${gym.name}, ${gym.address}. Ціни абонементів з акціями та графік роботи.`,
  };
}

export default function GymPage({ params }: PageProps<"/gyms/[slug]">) {
  return (
    <Suspense>
      <GymProfile slug={params.then(({ slug }) => slug)} />
    </Suspense>
  );
}
