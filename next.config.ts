import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
