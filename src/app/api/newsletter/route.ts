import { createNewsletterHandler } from "@seo/components/server";

export const POST = createNewsletterHandler({
  audienceId: process.env.RESEND_AUDIENCE_ID || "",
  fromEmail: "Matt from WhatsApp MCP <hello@whatsapp-mcp-macos.com>",
  brand: "WhatsApp MCP for macOS",
  siteUrl: "https://whatsapp-mcp-macos.com",
  bookingUrl: "https://cal.com/team/mediar/whatsapp-mcp",
});
