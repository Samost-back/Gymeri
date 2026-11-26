import { describe, expect, it } from "vitest";
import {
  daysLeftText,
  formatPeriod,
  periodProgress,
  todayIso,
} from "@/modules/memberships/model/labels";

describe("formatPeriod", () => {
  it("names the year once when the period fits in it", () => {
    expect(formatPeriod("2026-11-17", "2026-12-16")).toBe("17 листопада – 16 грудня 2026");
  });

  it("names both years when the period crosses New Year", () => {
    expect(formatPeriod("2026-12-10", "2027-01-08")).toBe("10 грудня 2026 – 8 січня 2027");
  });
});

describe("daysLeftText", () => {
  const period = { startsOn: "2026-12-01", endsOn: "2026-12-30" };

  it("speaks of the start, the days left or the end by status", () => {
    expect(daysLeftText({ ...period, status: "upcoming", daysLeft: 30 })).toBe(
      "Почнеться 1 грудня",
    );
    expect(daysLeftText({ ...period, status: "ending_soon", daysLeft: 1 })).toBe(
      "Лишилось 1 день",
    );
    expect(daysLeftText({ ...period, status: "expired", daysLeft: 0 })).toBe("Термін минув");
  });

  it("gives a used-up membership its end date, not days it could still be used", () => {
    expect(daysLeftText({ ...period, status: "used_up", daysLeft: 12 })).toBe(
      "Термін до 30 грудня",
    );
  });
});

describe("periodProgress", () => {
  it("runs from empty on the first day to full after the last", () => {
    const period = { startsOn: "2026-12-01", endsOn: "2026-12-30" };

    expect(periodProgress({ ...period, daysLeft: 30 })).toBe(0);
    expect(periodProgress({ ...period, daysLeft: 15 })).toBe(0.5);
    expect(periodProgress({ ...period, daysLeft: 0 })).toBe(1);
  });
});

describe("todayIso", () => {
  it("uses the local calendar day, not the UTC one", () => {
    // 00:30 local on 1 December: UTC may still be 30 November.
    expect(todayIso(new Date(2026, 11, 1, 0, 30))).toBe("2026-12-01");
  });
});
