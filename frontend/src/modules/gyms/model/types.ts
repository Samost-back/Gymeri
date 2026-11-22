export type CatalogStats = {
  gyms: number;
  chains: number;
  districts: number;
};

export type FilterOption = {
  slug: string;
  name: string;
};

export type FilterOptions = {
  districts: FilterOption[];
  amenities: FilterOption[];
};

export type ChainCard = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  logoUrl: string | null;
  locationsCount: number;
  districts: string[];
  priceFrom: number | null;
};

export type GymListing = {
  slug: string;
  name: string;
  chainSlug: string;
  chainName: string;
  district: string;
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
  district?: string;
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
  // The chain's website; empty when it has none.
  website: string;
  address: string;
  latitude: number;
  longitude: number;
};
