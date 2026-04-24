import { createBookCallHandler } from "@seo/components/server";

export const POST = createBookCallHandler({
  site: "whatsapp-mcp",
  audienceId: "",
  fromEmail: "Matt from WhatsApp MCP <matt@mediar.ai>",
  brand: "WhatsApp MCP for macOS",
  siteUrl: "https://whatsapp-mcp-macos.com",
  redirectBaseUrl: "https://whatsapp-mcp-macos.com/go/book",
});
