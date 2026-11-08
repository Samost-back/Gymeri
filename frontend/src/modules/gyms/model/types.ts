export type GymSummary = {
  slug: string;
  name: string;
  brandTag: string;
  highlight: string;
  tag?: string;
  areaM2: number;
  address: string;
  hoursSummary: string;
  locationsCount: number;
  districts: string[];
  imageUrl: string;
  imageAlt: string;
};

export type CatalogStats = {
  gyms: number;
  chains: number;
  districts: number;
};
