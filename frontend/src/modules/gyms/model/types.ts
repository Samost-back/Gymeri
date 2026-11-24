export type CatalogStats = {
  gyms: number;
  chains: number;
  streets: number;
};

export type FilterOption = {
  slug: string;
  name: string;
};

export type FilterOptions = {
  streets: FilterOption[];
  chains: FilterOption[];
  types: FilterOption[];
  audiences: FilterOption[];
};

export type ChainCard = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  logoUrl: string | null;
  locationsCount: number;
  streets: string[];
  priceFrom: number | null;
};

// A promo plan of its own, e.g. "3 місяці за ціною двох", not a discount on another plan.
export type Promo = {
  planName: string;
  price: number;
  // ISO date, the last day it is sold; null while the chain keeps it on.
  endsOn: string | null;
};

export type GymListing = {
  slug: string;
  name: string;
  chainSlug: string;
  chainName: string;
  street: string;
  address: string;
  highlight: string;
  areaM2: number | null;
  types: FilterOption[];
  // Groups with a plan of their own here, e.g. students.
  audiences: FilterOption[];
  // The promo with the lowest price per month on sale right now.
  promo: Promo | null;
  hoursSummary: string;
  isOpenNow: boolean;
  priceFrom: number | null;
  photoUrl: string | null;
  // False when the gym has only some of the requested gym types.
  isFullMatch: boolean;
};

export const SORT_OPTIONS = [
  { code: "name", label: "За назвою" },
  { code: "price", label: "Спочатку дешевші" },
  { code: "area", label: "Спочатку більші" },
] as const;

export type SortCode = (typeof SORT_OPTIONS)[number]["code"];

export type GymSearchParams = {
  street?: string;
  chain?: string;
  types: string[];
  audience?: string;
  promo: boolean;
  openNow: boolean;
  sort: SortCode;
};

export type GymMapPoint = {
  slug: string;
  name: string;
  chainName: string;
  // The chain's links; each is empty when the chain has none.
  website: string;
  instagramUrl: string;
  address: string;
  latitude: number;
  longitude: number;
};

export type DayHours = {
  name: string;
  // Null when the gym is closed that day.
  hours: string | null;
  isToday: boolean;
};

export type PlanOffer = {
  name: string;
  durationDays: number;
  // Null means unlimited visits during the term.
  visitsLimit: number | null;
  // Who may buy it; empty means everyone.
  audiences: FilterOption[];
  // E.g. "Пн, Ср, Пт до 18:00"; empty when the plan works whenever the gym is open.
  accessHours: string;
  price: number;
  isPromo: boolean;
  // ISO date, the last day a promo is sold; null for regular plans and open-ended promos.
  promoEndsOn: string | null;
};

export type GymPhoto = {
  url: string;
  alt: string;
};

export type GymProfile = {
  slug: string;
  name: string;
  chainSlug: string;
  chainName: string;
  // The chain's links; each is empty when the chain has none.
  website: string;
  instagramUrl: string;
  address: string;
  highlight: string;
  areaM2: number | null;
  phone: string;
  types: FilterOption[];
  latitude: number;
  longitude: number;
  photos: GymPhoto[];
  hoursSummary: string;
  isOpenNow: boolean;
  week: DayHours[];
  plans: PlanOffer[];
};
