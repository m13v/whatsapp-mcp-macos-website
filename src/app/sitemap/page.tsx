import type { Metadata } from "next";
import { HtmlSitemap } from "@seo/components";
import { walkPages } from "@seo/components/server";

export const metadata: Metadata = {
  title: "Sitemap — WhatsApp MCP for macOS",
  description: "Every page on whatsapp-mcp-macos.com, grouped by section.",
};

export default function SitemapPage() {
  const pages = walkPages({ excludePaths: ["api"] });
  return <HtmlSitemap pages={pages} brandName="WhatsApp MCP" />;
}
