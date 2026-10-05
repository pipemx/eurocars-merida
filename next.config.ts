import type { NextConfig } from "next";

// Modo demostración (ver src/lib/demo-mode.ts): activo salvo en producción de Vercel, o lo que diga NEXT_PUBLIC_DEMO_MODE.
const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE ?? (process.env.VERCEL_ENV === "production" ? "0" : "1");

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_DEMO_MODE: demoMode },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 430, 640, 768, 1024, 1280, 1440, 1920, 2400],
  },
  // Admin demo: nunca indexable (además de la metadata noindex del layout).
  async headers() {
    return [{ source: "/admin-demo/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] }];
  },
};

export default nextConfig;
