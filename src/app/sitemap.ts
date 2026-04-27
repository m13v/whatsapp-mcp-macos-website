import type { MetadataRoute } from "next";
import { generateSitemap } from "@seo/components/server";

export default function sitemap(): MetadataRoute.Sitemap {
  return generateSitemap({ baseUrl: "https://whatsapp-mcp-macos.com" });
}
