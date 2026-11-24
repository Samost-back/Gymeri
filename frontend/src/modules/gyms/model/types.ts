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

export type DiscountOffer = {
  planName: string;
  kind: "percent" | "fixed";
  value: number;
  // ISO date, the last day the price holds.
  endsOn: string;
  fullPrice: number;
  price: number;
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
  // The promotion with the biggest saving right now.
  discount: DiscountOffer | null;
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
  discount: boolean;
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
  // What a buyer pays today, with the discount already applied.
  price: number;
  discount: DiscountOffer | null;
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
