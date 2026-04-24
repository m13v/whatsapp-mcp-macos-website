import { createBookCallRedirectHandler } from "@seo/components/server";

export const GET = createBookCallRedirectHandler({
  site: "whatsapp-mcp",
  fallbackBookingUrl: "https://cal.com/team/mediar/whatsapp-mcp",
});
