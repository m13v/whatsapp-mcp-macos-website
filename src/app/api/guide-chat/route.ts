import { createGuideChatHandler } from "@seo/components/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createGuideChatHandler({
  app: "whatsapp-mcp-macos",
  brand: "WhatsApp MCP for macOS",
  siteDescription:
    "MCP server that drives the native WhatsApp desktop app on macOS through accessibility APIs.",
  contentDir: "src/app/(main)/t",
});
