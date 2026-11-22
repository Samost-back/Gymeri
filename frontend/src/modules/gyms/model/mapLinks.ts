import { isHttpUrl } from "@/shared/lib/url";
import type { GymMapPoint } from "./types";

// Opens the gym as a place, not a ready route: a route link makes Google guess the start
// point, often wrongly, while from the place "Directions" starts at the user's own location.
export function googleMapsPlaceUrl(point: Pick<GymMapPoint, "latitude" | "longitude">): string {
  return `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`;
}

export type ChainLink = { kind: "website" | "instagram"; href: string };

// The website when it works as a link, otherwise Instagram: some chains have no site at all.
export function chainLinkOf(
  point: Pick<GymMapPoint, "website" | "instagramUrl">,
): ChainLink | null {
  if (isHttpUrl(point.website)) {
    return { kind: "website", href: point.website };
  }
  if (isHttpUrl(point.instagramUrl)) {
    return { kind: "instagram", href: point.instagramUrl };
  }
  return null;
}
