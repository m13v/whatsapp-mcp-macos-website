import type { NextConfig } from "next";
import path from "node:path";
import { withSeoContent } from "@seo/components/next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),
  transpilePackages: ["@seo/components", "@m13v/seo-components"],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@assistant-ui/react": path.resolve(
        process.cwd(),
        "src/shims/assistant-ui-react.tsx",
      ),
      "@google/generative-ai": path.resolve(
        process.cwd(),
        "src/shims/google-generative-ai.ts",
      ),
      "@supabase/supabase-js": path.resolve(
        process.cwd(),
        "src/shims/supabase-js.ts",
      ),
      "posthog-js": path.resolve(process.cwd(), "src/shims/posthog-js.ts"),
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/t/mcp-server-for-whatsapp-without-touching-meta-s-bu",
        destination: "/t/whatsapp-mac-mcp-without-business-api",
        permanent: true,
      },
      {
        source: "/t/whatsapp-mcp-without-business-api",
        destination: "/t/whatsapp-mac-mcp-without-business-api",
        permanent: true,
      },
    ];
  },
};

export default withSeoContent(nextConfig, { contentDir: "src/app/(main)/t" });
