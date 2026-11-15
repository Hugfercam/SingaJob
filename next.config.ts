import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Fija la raíz del proyecto para que Turbopack no rastree lockfiles
    // ajenos en directorios superiores (por ejemplo, en la carpeta del usuario).
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Permite abrir la app por 127.0.0.1 en desarrollo, además de localhost.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
