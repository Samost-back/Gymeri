import { IconList } from "@/shared/ui";
import { NEWS_CATEGORIES } from "../categories";

const TOPICS = Object.values(NEWS_CATEGORIES).map(({ icon, topic, hint }) => ({
  icon,
  title: topic,
  hint,
}));

export function NewsTopics() {
  return <IconList items={TOPICS} label="Теми стрічки" />;
}
