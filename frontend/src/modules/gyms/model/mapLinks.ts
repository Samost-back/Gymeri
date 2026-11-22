import type { GymMapPoint } from "./types";

// Opens the gym as a place, not a ready route: a route link makes Google guess the start
// point, often wrongly, while from the place "Directions" starts at the user's own location.
export function googleMapsPlaceUrl(point: Pick<GymMapPoint, "latitude" | "longitude">): string {
  return `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`;
}
