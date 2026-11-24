import { describe, expect, it } from "vitest";
import type { Promo } from "@/modules/gyms/model/types";
import { promoText } from "@/modules/gyms/ui/GymCard/promoLabels";
import { formatPrice } from "@/shared/lib/format";

const promo: Promo = { planName: "3 місяці за ціною двох", price: 3000, endsOn: "2026-12-09" };
// Intl separates thousands with a no-break space, so the expected price comes from the same formatter.
const price = formatPrice(3000);

describe("promoText", () => {
  it("names the plan, its price and the last day", () => {
    expect(promoText(promo)).toBe(`«3 місяці за ціною двох» — ${price} до 9 грудня 2026`);
  });

  it("leaves out the date of a promo without an end", () => {
    expect(promoText({ ...promo, endsOn: null })).toBe(`«3 місяці за ціною двох» — ${price}`);
  });
});
