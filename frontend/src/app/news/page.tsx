import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsFeed, NewsTopics } from "@/modules/news";
import { Container, PageHero } from "@/shared/ui";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Новини спорту Луцька — події та знижки залів · Gymeri",
  description: "Спортивні події Луцька: забіги, турніри, відкриття залів і знижки на абонементи.",
};

export default function NewsPage() {
  return (
    <>
      <PageHero
        status="Gymeri // Новини"
        title="Спортивний Луцьк"
        accent="в одній стрічці."
        lead="Забіги, турніри, відкриття залів і знижки на абонементи. Збираємо події міста, щоб ви нічого не пропустили."
        aside={<NewsTopics />}
      />
      <main className={styles.main}>
        <Container>
          <Suspense>
            <NewsFeed />
          </Suspense>
        </Container>
      </main>
    </>
  );
}
