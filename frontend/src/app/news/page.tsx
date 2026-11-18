import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsFeed, NewsTopics } from "@/modules/news";
import { PageHero, PageMain } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Новини спорту Луцька — події та знижки залів · Gymeri",
  description: "Спортивні події Луцька: забіги, турніри, відкриття залів і знижки на абонементи.",
};

export default function NewsPage() {
  return (
    <>
      <PageHero
        title="Спортивний Луцьк"
        accent="в одній стрічці."
        lead="Забіги, турніри, відкриття залів і знижки на абонементи. Збираємо події міста, щоб ви нічого не пропустили."
        photoFocus="85% center"
        aside={<NewsTopics />}
      />
      <PageMain>
        <Suspense>
          <NewsFeed />
        </Suspense>
      </PageMain>
    </>
  );
}
