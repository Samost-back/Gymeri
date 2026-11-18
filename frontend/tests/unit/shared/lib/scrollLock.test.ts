import { describe, expect, it } from "vitest";
import { lockScroll } from "@/shared/lib/scrollLock";

describe("lockScroll", () => {
  it("hides overflow and restores the value that was there before", () => {
    const root = { style: { overflow: "auto" } };

    const unlock = lockScroll(root);
    expect(root.style.overflow).toBe("hidden");

    unlock();
    expect(root.style.overflow).toBe("auto");
  });

  it("keeps the page locked while an outer lock is still active", () => {
    const root = { style: { overflow: "" } };
    const unlockMenu = lockScroll(root);
    const unlockModal = lockScroll(root);

    unlockModal();
    expect(root.style.overflow).toBe("hidden");

    unlockMenu();
    expect(root.style.overflow).toBe("");
  });
});
