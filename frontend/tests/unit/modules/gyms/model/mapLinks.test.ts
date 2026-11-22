import { describe, expect, it } from "vitest";
import { chainLinkOf, googleMapsPlaceUrl } from "@/modules/gyms/model/mapLinks";

describe("googleMapsPlaceUrl", () => {
  it("points at the gym's coordinates, not its address text", () => {
    expect(googleMapsPlaceUrl({ latitude: 50.745126, longitude: 25.339579 })).toBe(
      "https://www.google.com/maps/search/?api=1&query=50.745126,25.339579",
    );
  });
});

describe("chainLinkOf", () => {
  const instagram = "https://www.instagram.com/gym/";

  it("prefers the website", () => {
    expect(chainLinkOf({ website: "https://gym.example", instagramUrl: instagram })).toEqual({
      kind: "website",
      href: "https://gym.example",
    });
  });

  it("falls back to Instagram when there is no usable website", () => {
    expect(chainLinkOf({ website: "", instagramUrl: instagram })).toEqual({
      kind: "instagram",
      href: instagram,
    });
  });

  it("gives no link when the chain has none", () => {
    expect(chainLinkOf({ website: "", instagramUrl: "" })).toBeNull();
  });
});
