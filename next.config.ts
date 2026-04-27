import type { NextConfig } from "next";
import { withSeoContent } from "@seo/components/next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@seo/components", "@m13v/seo-components"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default withSeoContent(nextConfig, { contentDir: "src/app/(main)/t" });
