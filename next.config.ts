import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@seo/components", "@m13v/seo-components"],
};

export default nextConfig;
