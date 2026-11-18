import { describe, expect, it } from "vitest";
import {
  EMPTY_SEARCH,
  gymsHref,
  parseSearchParams,
  toQuery,
} from "@/modules/gyms/model/searchParams";

describe("parseSearchParams", () => {
  it("reads every filter from the URL", () => {
    const params = parseSearchParams({
      district: "center",
      chain: "ia",
      amenity: ["pool", "strength"],
      open_now: "true",
      round_the_clock: "true",
      sort: "price",
    });

    expect(params).toEqual({
      district: "center",
      chain: "ia",
      amenities: ["pool", "strength"],
      openNow: true,
      roundTheClock: true,
      sort: "price",
    });
  });

  it("accepts a single amenity as a plain string", () => {
    expect(parseSearchParams({ amenity: "pool" }).amenities).toEqual(["pool"]);
  });

  it("falls back to sorting by name for an unknown sort", () => {
    expect(parseSearchParams({ sort: "random" }).sort).toBe("name");
  });

  it("treats anything but true as a disabled flag", () => {
    expect(parseSearchParams({ open_now: "yes" }).openNow).toBe(false);
  });
});

describe("toQuery", () => {
  it("leaves defaults out, so the backend gets only active filters", () => {
    expect(toQuery(EMPTY_SEARCH)).toEqual({
      district: undefined,
      chain: undefined,
      amenity: [],
      open_now: undefined,
      round_the_clock: undefined,
      sort: undefined,
    });
  });
});

describe("gymsHref", () => {
  it("opens the search without a query when nothing is selected", () => {
    expect(gymsHref(EMPTY_SEARCH)).toBe("/account");
  });

  it("repeats the amenity key for each selected amenity", () => {
    const href = gymsHref({ ...EMPTY_SEARCH, district: "center", amenities: ["pool", "sauna"] });

    expect(href).toBe("/account?district=center&amenity=pool&amenity=sauna");
  });

  it("builds a link that parses back to the same filters", () => {
    const params = { ...EMPTY_SEARCH, chain: "ia", openNow: true, sort: "area" as const };
    const query = Object.fromEntries(new URLSearchParams(gymsHref(params).split("?")[1]));

    expect(parseSearchParams(query)).toEqual(params);
  });
});
