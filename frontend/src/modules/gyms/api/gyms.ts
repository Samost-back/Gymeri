import { apiGet } from "@/shared/lib/api";
import { toQuery } from "../model/searchParams";
import type {
  CatalogStats,
  ChainCard,
  FilterOptions,
  GymListing,
  GymMapPoint,
  GymSearchParams,
} from "../model/types";

// Backend contract (snake_case, decimals as strings); mapped once here for the UI.
type ChainCardDto = {
  slug: string;
  name: string;
  short_name: string;
  description: string;
  logo_url: string | null;
  locations_count: number;
  districts: string[];
  price_from: string | null;
};

type GymListingDto = {
  slug: string;
  name: string;
  chain_slug: string;
  chain_name: string;
  district: string;
  address: string;
  highlight: string;
  area_m2: number | null;
  amenities: string[];
  hours_summary: string;
  is_open_now: boolean;
  is_round_the_clock: boolean;
  price_from: string | null;
  photo_url: string | null;
};

type GymMapPointDto = {
  slug: string;
  name: string;
  chain_name: string;
  website: string;
  address: string;
  latitude: number;
  longitude: number;
};

function toPrice(value: string | null): number | null {
  return value === null ? null : Number(value);
}

export function getCatalogStats(): Promise<CatalogStats> {
  return apiGet<CatalogStats>("catalog/stats/");
}

export function getFilterOptions(): Promise<FilterOptions> {
  return apiGet<FilterOptions>("catalog/filters/");
}

export async function getChains(): Promise<ChainCard[]> {
  const chains = await apiGet<ChainCardDto[]>("chains/");
  return chains.map((chain) => ({
    slug: chain.slug,
    name: chain.name,
    shortName: chain.short_name,
    description: chain.description,
    logoUrl: chain.logo_url,
    locationsCount: chain.locations_count,
    districts: chain.districts,
    priceFrom: toPrice(chain.price_from),
  }));
}

export async function searchGyms(params: GymSearchParams): Promise<GymListing[]> {
  const gyms = await apiGet<GymListingDto[]>("gyms/", toQuery(params));
  return gyms.map((gym) => ({
    slug: gym.slug,
    name: gym.name,
    chainSlug: gym.chain_slug,
    chainName: gym.chain_name,
    district: gym.district,
    address: gym.address,
    highlight: gym.highlight,
    areaM2: gym.area_m2,
    amenities: gym.amenities,
    hoursSummary: gym.hours_summary,
    isOpenNow: gym.is_open_now,
    isRoundTheClock: gym.is_round_the_clock,
    priceFrom: toPrice(gym.price_from),
    photoUrl: gym.photo_url,
  }));
}

export async function getMapPoints(): Promise<GymMapPoint[]> {
  const points = await apiGet<GymMapPointDto[]>("gyms/map/");
  return points.map((point) => ({
    slug: point.slug,
    name: point.name,
    chainName: point.chain_name,
    website: point.website,
    address: point.address,
    latitude: point.latitude,
    longitude: point.longitude,
  }));
}
