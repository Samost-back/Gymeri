"use client";

import dynamic from "next/dynamic";
import type { GymMapPoint } from "../../model/types";

// Leaflet touches `window` on import, so it loads only in the browser and only with the map.
const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

export function MapCanvas({ points }: { points: GymMapPoint[] }) {
  return <LeafletMap points={points} />;
}
