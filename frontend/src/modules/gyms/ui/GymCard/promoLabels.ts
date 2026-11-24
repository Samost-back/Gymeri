import { formatDateParts, formatPrice } from "@/shared/lib/format";
import type { Promo } from "../../model/types";

// Which plan, its price and, if set, the last day: "«3 місяці за ціною двох» — 3 000 грн до 9 грудня 2026".
export function promoText(promo: Promo): string {
  const text = `«${promo.planName}» — ${formatPrice(promo.price)}`;
  if (promo.endsOn === null) {
    return text;
  }
  const { day, monthYear } = formatDateParts(promo.endsOn);
  return `${text} до ${day} ${monthYear}`;
}
