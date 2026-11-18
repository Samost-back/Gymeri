import { Icon, PageHeader } from "@/shared/ui";
import { getNews } from "../../api/news";
import { NewsCard } from "../NewsCard/NewsCard";
import styles from "./NewsFeed.module.css";

export async function NewsFeed() {
  const [lead, ...rest] = await getNews();

  return (
    <section>
      <PageHeader title="Найближче в місті" />
      <p className={styles.demoNote}>
        <Icon name="info" size={18} />
        Це приклади оголошень, щоб показати, як виглядатиме стрічка. Справжні новини з’являться
        згодом.
      </p>
      {lead && <NewsCard item={lead} featured />}
      {rest.length > 0 && (
        <>
          <h3 className={styles.agendaTitle}>Далі в календарі</h3>
          <div className={styles.agenda}>
            {rest.map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
