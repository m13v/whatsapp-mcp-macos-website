import type { MetadataRoute } from "next";
import { generateRobots } from "@seo/components/server";

export default function robots(): MetadataRoute.Robots {
  return generateRobots({ baseUrl: "https://whatsapp-mcp-macos.com" });
}
