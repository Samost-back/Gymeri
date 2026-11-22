import { formatDateParts, formatPrice } from "@/shared/lib/format";
import type { DiscountOffer } from "../../model/types";

export function discountAmount(offer: DiscountOffer): string {
  return offer.kind === "percent" ? `−${offer.value}%` : `−${formatPrice(offer.value)}`;
}

// What is off, on which plan and until when: "−15% на «Безліміт на місяць» до 23 грудня 2026".
export function discountText(offer: DiscountOffer): string {
  const { day, monthYear } = formatDateParts(offer.endsOn);
  return `${discountAmount(offer)} на «${offer.planName}» до ${day} ${monthYear}`;
}
