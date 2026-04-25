import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV === "development";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  workboxOptions: {
    disableDevLogs: true,
    // Don't intercept API requests — SSE streaming and live data must hit the server.
    navigateFallbackDenylist: [/^\/api\//],
  },
  disable: isDev,
});

const baseConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // `output: 'export'` does not run a Next server in production — Express
  // serves the static `out/` build. `rewrites` only work in `next dev`.
  ...(isDev && {
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

export default withPWA(baseConfig as any);
