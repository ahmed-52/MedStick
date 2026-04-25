import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // PWA / service worker is intentionally disabled. Earlier builds shipped a
  // workbox SW that runtime-cached /api/* GET requests with NetworkFirst, so a
  // stale `apis` cache made newly created chats invisible to the sidebar.
  // The app is run inside the office on the express server, so offline support
  // isn't a requirement — keeping the SW out is the safer default.
  ...(process.env.NODE_ENV === "development" && {
    async rewrites() {
      return [
        { source: "/api/:path*", destination: "http://127.0.0.1:3000/api/:path*" },
      ];
    },
  }),
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default baseConfig;
