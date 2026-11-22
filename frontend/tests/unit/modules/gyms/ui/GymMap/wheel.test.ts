import { describe, expect, it } from "vitest";
import { classifyWheel } from "@/modules/gyms/ui/GymMap/wheel";

const PIXELS = 0;
const LINES = 1;

describe("classifyWheel", () => {
  it("treats a ctrl wheel as a touchpad pinch", () => {
    expect(classifyWheel({ ctrlKey: true, deltaMode: PIXELS, deltaX: 0, deltaY: -3.5 })).toBe(
      "pinch",
    );
  });

  it("treats small fractional deltas as a two-finger pan", () => {
    expect(classifyWheel({ ctrlKey: false, deltaMode: PIXELS, deltaX: 2.5, deltaY: 7.25 })).toBe(
      "two-finger-pan",
    );
  });

  it("treats whole notches and line scrolling as a mouse wheel", () => {
    expect(classifyWheel({ ctrlKey: false, deltaMode: PIXELS, deltaX: 0, deltaY: 100 })).toBe(
      "mouse-wheel",
    );
    expect(classifyWheel({ ctrlKey: false, deltaMode: LINES, deltaX: 0, deltaY: 3 })).toBe(
      "mouse-wheel",
    );
  });
});
