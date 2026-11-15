import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Hilos en lugar de procesos: más rápido y funciona en entornos que
    // bloquean lanzar procesos hijos (sandboxes, algunos CI).
    pool: "threads",
  },
});
