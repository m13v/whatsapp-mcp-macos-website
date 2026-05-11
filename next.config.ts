import type { NextConfig } from "next";
import { withSeoContent } from "@seo/components/next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ["@seo/components", "@m13v/seo-components"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return [
      {
        source: "/t/mcp-server-for-whatsapp-without-touching-meta-s-bu",
        destination: "/t/whatsapp-mac-mcp-without-business-api",
        permanent: true,
      },
    ];
  },
};

export default withSeoContent(nextConfig, { contentDir: "src/app/(main)/t" });
