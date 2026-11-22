import { describe, expect, it } from "vitest";
import { googleMapsPlaceUrl } from "@/modules/gyms/model/mapLinks";

describe("googleMapsPlaceUrl", () => {
  it("points at the gym's coordinates, not its address text", () => {
    expect(googleMapsPlaceUrl({ latitude: 50.745126, longitude: 25.339579 })).toBe(
      "https://www.google.com/maps/search/?api=1&query=50.745126,25.339579",
    );
  });
});
