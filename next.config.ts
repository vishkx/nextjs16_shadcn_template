import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Experimental features for Next.js 16.1
  experimental: {
    // Better tree-shaking for large icon/utility libraries
    optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
  },

  // Image optimization for external images (GitHub avatars)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // Enable compression
  compress: true,

  // Strict mode for better development practices
  reactStrictMode: true,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
