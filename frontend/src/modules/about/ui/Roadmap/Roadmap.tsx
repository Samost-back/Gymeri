import { IconList, type IconListItem, Tag } from "@/shared/ui";

const LIVE = <Tag variant="solid">Працює</Tag>;
const SOON = <Tag variant="muted">Скоро</Tag>;

const STAGES: IconListItem[] = [
  { icon: "search", title: "Каталог залів", hint: "Адреси, графік, ціни й фільтри", badge: LIVE },
  { icon: "card_membership", title: "Мої абонементи", hint: "Залишок днів і тренувань", badge: SOON },
  { icon: "schedule", title: "Нагадування", hint: "Коли абонемент закінчується", badge: SOON },
  { icon: "person", title: "Тренери", hint: "Профілі й заявки на тренування", badge: SOON },
];

// What already works and what comes next, so the page sets honest expectations.
export function Roadmap() {
  return <IconList items={STAGES} label="Що вже працює і що далі" />;
}
