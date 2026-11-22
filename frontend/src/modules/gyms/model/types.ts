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
  amenities: FilterOption[];
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

export type GymListing = {
  slug: string;
  name: string;
  chainSlug: string;
  chainName: string;
  street: string;
  address: string;
  highlight: string;
  areaM2: number | null;
  amenities: string[];
  hoursSummary: string;
  isOpenNow: boolean;
  isRoundTheClock: boolean;
  priceFrom: number | null;
  photoUrl: string | null;
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
  amenities: string[];
  openNow: boolean;
  roundTheClock: boolean;
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
