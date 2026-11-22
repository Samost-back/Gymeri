import { describe, expect, it } from "vitest";
import { isHttpUrl } from "@/shared/lib/url";

describe("isHttpUrl", () => {
  it("accepts http and https links", () => {
    expect(isHttpUrl("https://interatletika.lutsk.ua")).toBe(true);
    expect(isHttpUrl("http://example.com")).toBe(true);
  });

  it("rejects script links and text that is not a URL", () => {
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("")).toBe(false);
  });
});
