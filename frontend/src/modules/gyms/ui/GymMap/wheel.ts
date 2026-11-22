import type { Map as LeafletMap } from "leaflet";

// WheelEvent.DOM_DELTA_PIXEL; a literal, so the classifier runs outside the browser too.
const DELTA_IN_PIXELS = 0;

export type WheelGesture = "pinch" | "mouse-wheel" | "two-finger-pan";

// Browsers report a touchpad pinch as a wheel event with ctrlKey. A mouse wheel scrolls by
// lines or in whole notches (100 or 120 px) on one axis; a touchpad sends small fractional
// deltas, often on both axes. The notch test is a heuristic: no API tells the devices apart.
export function classifyWheel(
  event: Pick<WheelEvent, "ctrlKey" | "deltaMode" | "deltaX" | "deltaY">,
): WheelGesture {
  if (event.ctrlKey) {
    return "pinch";
  }
  const isNotch =
    event.deltaX === 0 && Number.isInteger(event.deltaY) && Math.abs(event.deltaY) >= 100;
  return event.deltaMode !== DELTA_IN_PIXELS || isNotch
    ? "mouse-wheel"
    : "two-finger-pan";
}

const PINCH_ZOOM_PER_PX = 0.01;
const WHEEL_ZOOM_STEP = 0.5;

// Leaflet's own wheel handler zooms on every scroll; this one pans on a two-finger swipe,
// like Google Maps, and zooms only on a pinch or a mouse wheel.
export function handleWheelGestures(map: LeafletMap): () => void {
  const container = map.getContainer();

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const gesture = classifyWheel(event);
    if (gesture === "two-finger-pan") {
      map.panBy([event.deltaX, event.deltaY], { animate: false });
      return;
    }
    const zoomChange =
      gesture === "pinch"
        ? -event.deltaY * PINCH_ZOOM_PER_PX
        : -Math.sign(event.deltaY) * WHEEL_ZOOM_STEP;
    map.setZoomAround(map.mouseEventToContainerPoint(event), map.getZoom() + zoomChange, {
      animate: gesture === "mouse-wheel",
    });
  };

  // Not passive: preventDefault keeps the page and the browser's own pinch zoom out of it.
  container.addEventListener("wheel", onWheel, { passive: false });
  return () => container.removeEventListener("wheel", onWheel);
}
