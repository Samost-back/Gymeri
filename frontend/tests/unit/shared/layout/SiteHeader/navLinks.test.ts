import { describe, expect, it } from "vitest";
import { isNavLinkActive } from "@/shared/layout/SiteHeader/navLinks";

describe("isNavLinkActive", () => {
  it("marks the home tab only on the home page", () => {
    expect(isNavLinkActive("/", "/")).toBe(true);
    expect(isNavLinkActive("/news", "/")).toBe(false);
  });

  it("keeps a tab active on its subpages", () => {
    expect(isNavLinkActive("/news/spring-run", "/news")).toBe(true);
  });

  it("does not match a different page that shares a prefix", () => {
    expect(isNavLinkActive("/newsletter", "/news")).toBe(false);
  });
});
