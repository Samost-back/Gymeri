import type { NewsItem } from "../model/types";

// Demo posts until the news backend exists; the page marks them as examples.
// Ordered by date: the feed opens with the nearest event.
const DEMO_NEWS: NewsItem[] = [
  {
    slug: "student-discount",
    category: "discount",
    title: "Мінус 20% на перший місяць для студентів",
    excerpt: "Для нових клієнтів зі студентським квитком на безлімітний абонемент на 30 днів.",
    date: "2026-12-01",
    place: "Усі зали мережі",
  },
  {
    slug: "new-gym-33",
    category: "opening",
    title: "Новий зал у 33-му мікрорайоні",
    excerpt: "Силова зона, кардіо й групові заняття. До відкриття діє передпродаж абонементів.",
    date: "2027-01-15",
    place: "33-й мікрорайон",
  },
  {
    slug: "powerlifting-open",
    category: "tournament",
    title: "Відкритий турнір з пауерліфтингу",
    excerpt: "Жим лежачи й станова тяга серед аматорів. Для глядачів вхід вільний.",
    date: "2027-02-20",
    place: "Центр",
  },
  {
    slug: "spring-run",
    category: "event",
    title: "Весняний забіг набережною Стиру",
    excerpt:
      "Аматорський старт на 5 і 10 км для будь-якого рівня підготовки. Реєстрація відкриється за місяць до забігу.",
    date: "2027-04-18",
    place: "Набережна Стиру",
  },
];

export async function getNews(): Promise<NewsItem[]> {
  return DEMO_NEWS;
}
