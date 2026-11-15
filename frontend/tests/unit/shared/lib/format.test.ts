import { describe, expect, it } from "vitest";
import { formatDateParts, pluralize } from "@/shared/lib/format";

const GYMS = { one: "зал", few: "зали", many: "залів" };

describe("pluralize", () => {
  it.each([
    [1, "1 зал"],
    [3, "3 зали"],
    [5, "5 залів"],
    [11, "11 залів"],
    [21, "21 зал"],
    [24, "24 зали"],
  ])("follows Ukrainian plural rules for %i", (count, expected) => {
    expect(pluralize(count, GYMS)).toBe(expected);
  });
});

describe("formatDateParts", () => {
  it("puts the month in the genitive case", () => {
    expect(formatDateParts("2027-04-18")).toEqual({ day: "18", monthYear: "квітня 2027" });
  });

  it("keeps the calendar date in a time zone behind UTC", () => {
    expect(formatDateParts("2027-01-01").day).toBe("1");
  });
});
