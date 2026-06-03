import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sirve imagenes optimizadas en formatos modernos (mucho mas ligeros que JP/PNG).
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    // Convierte los imports de barril de estas librerias en imports granulares,
    // para que solo entre al bundle lo que realmente se usa (menos JS inicial).
    optimizePackageImports: [
      "lucide-react",
      "@mui/material",
      "@mui/icons-material",
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
      "radix-ui",
    ],
  },
};

export default nextConfig;
