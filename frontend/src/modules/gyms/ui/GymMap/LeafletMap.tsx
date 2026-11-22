"use client";

import "leaflet/dist/leaflet.css";
import { divIcon, latLngBounds, map as createMap, marker, tileLayer } from "leaflet";
import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Icon } from "@/shared/ui";
import { type ChainLink, chainLinkOf, googleMapsPlaceUrl } from "../../model/mapLinks";
import type { GymMapPoint } from "../../model/types";
import styles from "./GymMap.module.css";
import { handleWheelGestures } from "./wheel";

const SINGLE_GYM_ZOOM = 15;

// OpenStreetMap needs no key and has Ukrainian street names; fine for our traffic under its
// tile usage policy, with attribution. A busy production site should move to a paid provider.
const TILES_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILES_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Leaflet positions the marker element with transforms, so the diamond shape lives on a child.
const MARKER_ICON = divIcon({
  className: styles.marker,
  html: "<span></span>",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

// Leaflet is driven directly from one effect: it creates the map on mount and removes it on
// cleanup, so React's dev double mount and Next's hidden route trees can't leave a stale map
// on the container (react-leaflet failed exactly there).
export default function LeafletMap({ points }: { points: GymMapPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const map = createMap(container, {
      // Wheel and touchpad gestures are handled by handleWheelGestures instead.
      scrollWheelZoom: false,
      // No snapping, so a pinch zooms smoothly; the +/- buttons still move in half steps.
      zoomSnap: 0,
      zoomDelta: 0.5,
      // City zoom levels only.
      minZoom: 11,
      maxZoom: 18,
    });
    const stopWheelGestures = handleWheelGestures(map);
    // A bigger buffer keeps more tiles around the view, so fewer blank squares show up.
    tileLayer(TILES_URL, { attribution: TILES_ATTRIBUTION, keepBuffer: 4 }).addTo(map);

    // Popups are React components rendered into the elements Leaflet shows.
    const popupRoots: Root[] = points.map((point) => {
      const content = document.createElement("div");
      const root = createRoot(content);
      root.render(<GymPopup point={point} />);
      marker([point.latitude, point.longitude], { icon: MARKER_ICON, title: point.name })
        .bindPopup(content)
        .addTo(map);
      return root;
    });

    // No fallback view: GymMap shows an empty state instead of the map when there are no points.
    const [first] = points;
    if (points.length > 1) {
      const bounds = latLngBounds(points.map((point) => [point.latitude, point.longitude]));
      map.fitBounds(bounds, { padding: [48, 48] });
    } else if (first) {
      map.setView([first.latitude, first.longitude], SINGLE_GYM_ZOOM);
    }

    // Escape would otherwise close the whole modal; with a popup open it closes just the popup.
    // Capture phase and preventDefault run before the dialog turns the key into "cancel".
    let popupOpen = false;
    map.on("popupopen", () => {
      popupOpen = true;
    });
    map.on("popupclose", () => {
      popupOpen = false;
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && popupOpen) {
        event.preventDefault();
        event.stopPropagation();
        map.closePopup();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      stopWheelGestures();
      map.remove();
      // React refuses to unmount a root synchronously while it is committing another one.
      setTimeout(() => {
        for (const root of popupRoots) {
          root.unmount();
        }
      });
    };
  }, [points]);

  return <div ref={containerRef} className={styles.map} />;
}

// Labels are presentation, so they live here, not in the model.
const CHAIN_LINK_LABELS: Record<ChainLink["kind"], string> = {
  website: "Сайт",
  instagram: "Instagram",
};

function GymPopup({ point }: { point: GymMapPoint }) {
  const chainLink = chainLinkOf(point);
  return (
    <div className={styles.popup}>
      <span className={styles.chain}>{point.chainName}</span>
      <strong className={styles.name}>{point.name}</strong>
      <span className={styles.address}>{point.address}</span>
      <div className={styles.actions}>
        <a
          href={googleMapsPlaceUrl(point)}
          className={styles.primaryAction}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="map" size={16} />
          Google Maps
        </a>
        {chainLink && (
          <a
            href={chainLink.href}
            className={styles.action}
            target="_blank"
            rel="noopener noreferrer"
          >
            {CHAIN_LINK_LABELS[chainLink.kind]}
          </a>
        )}
      </div>
    </div>
  );
}
