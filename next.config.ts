import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sistema interno com dados sempre ao vivo: renderização dinâmica padrão
  // (sem Cache Components) para evitar dados desatualizados na tela.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  poweredByHeader: false,
};

export default nextConfig;
