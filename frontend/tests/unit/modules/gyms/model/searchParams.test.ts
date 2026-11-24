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
      street: "voli",
      chain: "ia",
      type: ["pool", "strength"],
      audience: "students",
      promo: "true",
      open_now: "true",
      sort: "price",
    });

    expect(params).toEqual({
      street: "voli",
      chain: "ia",
      types: ["pool", "strength"],
      audience: "students",
      promo: true,
      openNow: true,
      sort: "price",
    });
  });

  it("accepts a single gym type as a plain string", () => {
    expect(parseSearchParams({ type: "pool" }).types).toEqual(["pool"]);
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
      street: undefined,
      chain: undefined,
      type: [],
      audience: undefined,
      promo: undefined,
      open_now: undefined,
      sort: undefined,
    });
  });
});

describe("gymsHref", () => {
  it("opens the search without a query when nothing is selected", () => {
    expect(gymsHref(EMPTY_SEARCH)).toBe("/account");
  });

  it("repeats the type key for each selected gym type", () => {
    const href = gymsHref({ ...EMPTY_SEARCH, street: "voli", types: ["pool", "sauna"] });

    expect(href).toBe("/account?street=voli&type=pool&type=sauna");
  });

  it("builds a link that parses back to the same filters", () => {
    const params = { ...EMPTY_SEARCH, chain: "ia", openNow: true, sort: "area" as const };
    const query = Object.fromEntries(new URLSearchParams(gymsHref(params).split("?")[1]));

    expect(parseSearchParams(query)).toEqual(params);
  });
});
