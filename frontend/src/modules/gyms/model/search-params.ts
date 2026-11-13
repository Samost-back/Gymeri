import type { QueryValue } from "@/shared/lib/api";
import { SORT_OPTIONS, type GymSearchParams, type SortCode } from "./types";

type RawSearchParams = Record<string, string | string[] | undefined>;

export const EMPTY_SEARCH: GymSearchParams = {
  amenities: [],
  openNow: false,
  roundTheClock: false,
  sort: "name",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isSortCode(value: string | undefined): value is SortCode {
  return SORT_OPTIONS.some((option) => option.code === value);
}

// The URL is the source of truth for filters, so links and the back button just work.
export function parseSearchParams(raw: RawSearchParams): GymSearchParams {
  const sort = first(raw.sort);
  return {
    district: first(raw.district),
    chain: first(raw.chain),
    amenities: [raw.amenity ?? []].flat(),
    openNow: first(raw.open_now) === "true",
    roundTheClock: first(raw.round_the_clock) === "true",
    sort: isSortCode(sort) ? sort : "name",
  };
}

export function toQuery(params: GymSearchParams): Record<string, QueryValue> {
  return {
    district: params.district,
    chain: params.chain,
    amenity: params.amenities,
    open_now: params.openNow ? "true" : undefined,
    round_the_clock: params.roundTheClock ? "true" : undefined,
    sort: params.sort === "name" ? undefined : params.sort,
  };
}

export function gymsHref(params: GymSearchParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(toQuery(params))) {
    for (const item of [value].flat()) {
      if (item) {
        query.append(key, item);
      }
    }
  }
  const search = query.toString();
  return search ? `/gyms?${search}` : "/gyms";
}
