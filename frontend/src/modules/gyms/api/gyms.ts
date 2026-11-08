import type { CatalogStats, GymSummary } from "../model/types";
import { PLACEHOLDER_CATALOG_STATS, PLACEHOLDER_GYMS } from "./placeholder-gyms";

// Callers already await these functions, so switching to the real API won't touch the pages.
export async function getGyms(): Promise<GymSummary[]> {
  return PLACEHOLDER_GYMS;
}

export async function getCatalogStats(): Promise<CatalogStats> {
  return PLACEHOLDER_CATALOG_STATS;
}
