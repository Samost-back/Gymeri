export type NewsCategory = "event" | "discount" | "opening" | "tournament";

export type NewsItem = {
  slug: string;
  category: NewsCategory;
  title: string;
  excerpt: string;
  // ISO date (YYYY-MM-DD): when the event happens or the offer starts.
  date: string;
  place: string;
};
