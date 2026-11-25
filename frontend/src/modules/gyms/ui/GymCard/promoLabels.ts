import { formatDateParts, formatPrice } from "@/shared/lib/format";
import type { Promo } from "../../model/types";

// Plan, price, the last day if set and who may buy it, if not everyone:
// "«Пробний» — 500 грн до 9 грудня 2026 · лише для: новачки".
export function promoText(promo: Promo): string {
  let text = `«${promo.planName}» — ${formatPrice(promo.price)}`;
  if (promo.endsOn !== null) {
    const { day, monthYear } = formatDateParts(promo.endsOn);
    text += ` до ${day} ${monthYear}`;
  }
  if (promo.audiences.length > 0) {
    const names = promo.audiences.map((audience) => audience.name.toLowerCase()).join(", ");
    text += ` · лише для: ${names}`;
  }
  return text;
}
