import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// A zone behind UTC: date-only strings parse as UTC midnight, so formatting them in local
// time would shift to the previous day. Tests must catch that on any developer machine.
process.env.TZ = "America/New_York";

export default defineConfig({
  resolve: {
    // Same "@/..." imports as in tsconfig, so tests import code the way the app does.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
  },
});
