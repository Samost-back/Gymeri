import { describe, expect, it } from "vitest";
import type { DiscountOffer } from "@/modules/gyms/model/types";
import { discountAmount, discountText } from "@/modules/gyms/ui/GymCard/discountLabels";

const offer: DiscountOffer = {
  planName: "Безліміт на місяць",
  kind: "percent",
  value: 15,
  endsOn: "2026-12-23",
  fullPrice: 1900,
  price: 1615,
};

describe("discountAmount", () => {
  it("shows a percent or an amount in hryvnias", () => {
    expect(discountAmount(offer)).toBe("−15%");
    expect(discountAmount({ ...offer, kind: "fixed", value: 400 })).toBe("−400 грн");
  });
});

describe("discountText", () => {
  it("names the plan and the last day of the offer", () => {
    expect(discountText(offer)).toBe("−15% на «Безліміт на місяць» до 23 грудня 2026");
  });
});
