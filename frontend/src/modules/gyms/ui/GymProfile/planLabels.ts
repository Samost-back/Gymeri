import { pluralize } from "@/shared/lib/format";

const DAYS_IN_MONTH = 30;
const DAYS_IN_YEAR = 365;

// Terms as gyms sell them: 30 days reads as a month and 365 as a year.
export function planTerm(days: number): string {
  if (days % DAYS_IN_YEAR === 0) {
    return pluralize(days / DAYS_IN_YEAR, { one: "рік", few: "роки", many: "років" });
  }
  if (days % DAYS_IN_MONTH === 0) {
    return pluralize(days / DAYS_IN_MONTH, { one: "місяць", few: "місяці", many: "місяців" });
  }
  return pluralize(days, { one: "день", few: "дні", many: "днів" });
}

export function planVisits(limit: number | null): string {
  if (limit === null) {
    return "Без обмеження відвідувань";
  }
  return pluralize(limit, { one: "відвідування", few: "відвідування", many: "відвідувань" });
}
