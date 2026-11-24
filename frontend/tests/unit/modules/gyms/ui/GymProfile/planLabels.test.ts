import { describe, expect, it } from "vitest";
import { planTerm, planVisits } from "@/modules/gyms/ui/GymProfile/planLabels";

describe("planTerm", () => {
  it("reads whole months and years the way gyms sell them", () => {
    expect(planTerm(30)).toBe("1 місяць");
    expect(planTerm(90)).toBe("3 місяці");
    expect(planTerm(365)).toBe("1 рік");
  });

  it("falls back to days for other terms", () => {
    expect(planTerm(1)).toBe("1 день");
    expect(planTerm(14)).toBe("14 днів");
  });
});

describe("planVisits", () => {
  it("shows a visit limit or that there is none", () => {
    expect(planVisits(12)).toBe("12 відвідувань");
    expect(planVisits(null)).toBe("Без обмеження відвідувань");
  });
});
