import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/shinobi-clash-tcg" : "",
  assetPrefix: isProd ? "/shinobi-clash-tcg/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
