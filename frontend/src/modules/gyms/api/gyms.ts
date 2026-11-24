import { ApiError, apiGet } from "@/shared/lib/api";
import { toQuery } from "../model/searchParams";
import type {
  CatalogStats,
  ChainCard,
  DiscountOffer,
  FilterOption,
  FilterOptions,
  GymListing,
  GymMapPoint,
  GymProfile,
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
  streets: string[];
  price_from: string | null;
};

type DiscountOfferDto = {
  plan_name: string;
  kind: "percent" | "fixed";
  value: string;
  ends_on: string;
  full_price: string;
  price: string;
};

type GymListingDto = {
  slug: string;
  name: string;
  chain_slug: string;
  chain_name: string;
  street: string;
  address: string;
  highlight: string;
  area_m2: number | null;
  types: FilterOption[];
  audiences: FilterOption[];
  discount: DiscountOfferDto | null;
  hours_summary: string;
  is_open_now: boolean;
  price_from: string | null;
  photo_url: string | null;
  is_full_match: boolean;
};

type GymMapPointDto = {
  slug: string;
  name: string;
  chain_name: string;
  website: string;
  instagram_url: string;
  address: string;
  latitude: number;
  longitude: number;
};

type GymProfileDto = {
  slug: string;
  name: string;
  chain_slug: string;
  chain_name: string;
  website: string;
  instagram_url: string;
  facebook_url: string;
  address: string;
  highlight: string;
  area_m2: number | null;
  phone: string;
  types: FilterOption[];
  latitude: number;
  longitude: number;
  photos: { url: string; alt: string }[];
  hours_summary: string;
  is_open_now: boolean;
  week: { name: string; hours: string | null; is_today: boolean }[];
  plans: {
    name: string;
    duration_days: number;
    visits_limit: number | null;
    audiences: FilterOption[];
    price: string;
    discount: DiscountOfferDto | null;
  }[];
};

function toPrice(value: string | null): number | null {
  return value === null ? null : Number(value);
}

function toDiscount(offer: DiscountOfferDto | null): DiscountOffer | null {
  return (
    offer && {
      planName: offer.plan_name,
      kind: offer.kind,
      value: Number(offer.value),
      endsOn: offer.ends_on,
      fullPrice: Number(offer.full_price),
      price: Number(offer.price),
    }
  );
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
    streets: chain.streets,
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
    street: gym.street,
    address: gym.address,
    highlight: gym.highlight,
    areaM2: gym.area_m2,
    types: gym.types,
    audiences: gym.audiences,
    discount: toDiscount(gym.discount),
    hoursSummary: gym.hours_summary,
    isOpenNow: gym.is_open_now,
    priceFrom: toPrice(gym.price_from),
    photoUrl: gym.photo_url,
    isFullMatch: gym.is_full_match,
  }));
}

export async function getMapPoints(): Promise<GymMapPoint[]> {
  const points = await apiGet<GymMapPointDto[]>("gyms/map/");
  return points.map((point) => ({
    slug: point.slug,
    name: point.name,
    chainName: point.chain_name,
    website: point.website,
    instagramUrl: point.instagram_url,
    address: point.address,
    latitude: point.latitude,
    longitude: point.longitude,
  }));
}

// A missing or unpublished gym is an expected answer, so the page can show its 404.
export async function getGym(slug: string): Promise<GymProfile | null> {
  let gym: GymProfileDto;
  try {
    gym = await apiGet<GymProfileDto>(`gyms/${encodeURIComponent(slug)}/`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
  return {
    slug: gym.slug,
    name: gym.name,
    chainSlug: gym.chain_slug,
    chainName: gym.chain_name,
    website: gym.website,
    instagramUrl: gym.instagram_url,
    facebookUrl: gym.facebook_url,
    address: gym.address,
    highlight: gym.highlight,
    areaM2: gym.area_m2,
    phone: gym.phone,
    types: gym.types,
    latitude: gym.latitude,
    longitude: gym.longitude,
    photos: gym.photos,
    hoursSummary: gym.hours_summary,
    isOpenNow: gym.is_open_now,
    week: gym.week.map((day) => ({ name: day.name, hours: day.hours, isToday: day.is_today })),
    plans: gym.plans.map((plan) => ({
      name: plan.name,
      durationDays: plan.duration_days,
      visitsLimit: plan.visits_limit,
      audiences: plan.audiences,
      price: Number(plan.price),
      discount: toDiscount(plan.discount),
    })),
  };
}
