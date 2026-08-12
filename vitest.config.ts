import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

// Node environment: these tests cover the server endpoint + pure lib functions,
// none of which need a DOM. The `@/…` alias mirrors tsconfig paths.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
