// TODO: requires Neon table `whatsappmcp_emails` (resend_id text PK, direction, from_email,
// to_email, subject, body_text, body_html, status, opened_at, clicked_at, delivered_at).
// Note: outbound rows are already written by `app/api/newsletter/route.ts` onSignup.
// Insert/update errors are caught and logged by the lib helper, so missing table
// will not crash the webhook, it just won't persist anything until the table exists.
import { createResendInboundHandler } from "@seo/components/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";

export const POST = createResendInboundHandler({
  domain: "whatsapp-mcp-macos.com",
  brand: "WhatsApp MCP",
  forwardFrom: "WhatsApp MCP Inbound <matt@whatsapp-mcp-macos.com>",
  forwardTo: process.env.WHATSAPP_MCP_INBOX_FORWARD || "i@m13v.com",
  onInbound: async (rec) => {
    const sql = getSql();
    await sql`
      INSERT INTO whatsappmcp_emails (resend_id, direction, from_email, to_email, subject, body_text, body_html, status)
      VALUES (${rec.resendId}, 'inbound', ${rec.fromEmail}, ${rec.toEmail}, ${rec.subject}, ${rec.bodyText}, ${rec.bodyHtml}, 'received')
      ON CONFLICT (resend_id) DO NOTHING
    `;
  },
  onDeliveryEvent: async ({ status, resendId, timestamp, type }) => {
    const sql = getSql();
    if (type === "email.opened") {
      await sql`UPDATE whatsappmcp_emails SET status = ${status}, opened_at = ${timestamp} WHERE resend_id = ${resendId}`;
    } else if (type === "email.clicked") {
      await sql`UPDATE whatsappmcp_emails SET status = ${status}, clicked_at = ${timestamp} WHERE resend_id = ${resendId}`;
    } else if (type === "email.delivered") {
      await sql`UPDATE whatsappmcp_emails SET status = ${status}, delivered_at = ${timestamp} WHERE resend_id = ${resendId}`;
    } else {
      await sql`UPDATE whatsappmcp_emails SET status = ${status} WHERE resend_id = ${resendId}`;
    }
  },
});

export async function GET() {
  return Response.json({ status: "ok" });
}
