import type { IconName } from "@/shared/ui";
import type { NewsCategory } from "../model/types";

type CategoryView = {
  // Singular for a card tag, plural for the list of feed topics.
  label: string;
  topic: string;
  hint: string;
  icon: IconName;
};

// Labels and icons are presentation, so they live in ui, not in the data model.
export const NEWS_CATEGORIES: Record<NewsCategory, CategoryView> = {
  event: {
    label: "Подія",
    topic: "Події",
    hint: "Забіги, фестивалі, відкриті тренування",
    icon: "event",
  },
  discount: {
    label: "Знижка",
    topic: "Знижки",
    hint: "Акції на абонементи в залах міста",
    icon: "sell",
  },
  opening: {
    label: "Відкриття",
    topic: "Відкриття",
    hint: "Нові зали та локації мереж",
    icon: "storefront",
  },
  tournament: {
    label: "Турнір",
    topic: "Турніри",
    hint: "Змагання для аматорів і глядачів",
    icon: "emoji_events",
  },
};
