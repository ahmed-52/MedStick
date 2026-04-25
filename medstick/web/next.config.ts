import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const baseConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  devIndicators: false,
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

// PWA: cache only the static shell. /api/* is NEVER cached — earlier builds
// runtime-cached /api/* with NetworkFirst, which made newly-created chats
// invisible to the sidebar (stale 24h list). Keep that route NetworkOnly.
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,
  extendDefaultRuntimeCaching: false,
  fallbacks: {
    document: "/~offline",
  },
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    navigateFallbackDenylist: [/^\/api\//],
    runtimeCaching: [
      {
        urlPattern: ({ url, sameOrigin }) =>
          sameOrigin && url.pathname.startsWith("/api/"),
        handler: "NetworkOnly",
        options: { cacheName: "api-no-cache" },
      },
      {
        urlPattern: /\/_next\/static\/.+/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /\.(?:woff2?|ttf|otf|eot)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "fonts",
          expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico|gif)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "images",
          expiration: { maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /\.(?:css|js)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-resources",
          expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 7 },
        },
      },
      {
        urlPattern: ({ request, sameOrigin, url }) =>
          sameOrigin && request.mode === "navigate" && !url.pathname.startsWith("/api/"),
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 7 },
        },
      },
    ],
  },
});

export default withPWA(baseConfig);
