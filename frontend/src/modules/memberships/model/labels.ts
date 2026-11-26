import { pluralize } from "@/shared/lib/format";
import type { MembershipCard, MembershipStatus } from "./types";

export const STATUS_LABELS: Record<MembershipStatus, string> = {
  upcoming: "Ще не почався",
  active: "Діє",
  ending_soon: "Закінчується",
  used_up: "Візити вичерпано",
  expired: "Закінчився",
};

// UTC on both sides: the dates are plain calendar days, so no time zone may shift them.
const dayMonth = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const dayMonthYear = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function stripYearSuffix(text: string): string {
  // Intl writes "16 грудня 2026 р."; the period reads cleaner without the abbreviation.
  return text.replace(/\s*р\.$/, "");
}

// "17 листопада – 16 грудня 2026"; the year shows twice only when the period spans two.
export function formatPeriod(startsOn: string, endsOn: string): string {
  const start = new Date(startsOn);
  const end = new Date(endsOn);
  const startText =
    start.getUTCFullYear() === end.getUTCFullYear()
      ? dayMonth.format(start)
      : stripYearSuffix(dayMonthYear.format(start));
  return `${startText} – ${stripYearSuffix(dayMonthYear.format(end))}`;
}

export function daysLeftText(
  card: Pick<MembershipCard, "status" | "daysLeft" | "startsOn" | "endsOn">,
): string {
  switch (card.status) {
    case "upcoming":
      return `Почнеться ${dayMonth.format(new Date(card.startsOn))}`;
    case "expired":
      return "Термін минув";
    // No visits left, so "days left" would read as days it can still be used.
    case "used_up":
      return `Термін до ${dayMonth.format(new Date(card.endsOn))}`;
    default:
      return `Лишилось ${pluralize(card.daysLeft, { one: "день", few: "дні", many: "днів" })}`;
  }
}

// Share of the period already gone, 0–1, for the progress bar.
export function periodProgress(
  card: Pick<MembershipCard, "startsOn" | "endsOn" | "daysLeft">,
): number {
  const totalDays = (Date.parse(card.endsOn) - Date.parse(card.startsOn)) / 86_400_000 + 1;
  return Math.min(Math.max(1 - card.daysLeft / totalDays, 0), 1);
}

// Local calendar date as the backend expects it; toISOString would give the UTC day, which
// is yesterday for anyone in Kyiv shortly after midnight.
export function todayIso(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
