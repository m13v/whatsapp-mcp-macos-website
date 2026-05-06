import { createNewsletterHandler } from "@seo/components/server";
import { getSql } from "@/lib/db";

const FROM = "Matt from WhatsApp MCP <matt@whatsapp-mcp-macos.com>";
const BRAND = "WhatsApp MCP for macOS";
const SITE_URL = "https://whatsapp-mcp-macos.com";
const GITHUB_URL = "https://github.com/m13v/whatsapp-mcp-macos";
const NPM_PACKAGE = "whatsapp-mcp-macos";
const INSTALL_CMD = `npm install -g ${NPM_PACKAGE}`;
const WELCOME_SUBJECT = "Your WhatsApp MCP install commands";

// Same JSON shape across Claude Code, Claude Desktop, Cursor, Windsurf.
// VS Code uses "servers" instead of "mcpServers", so it's rendered separately.
const STDIO_CONFIG = `{
  "mcpServers": {
    "whatsapp": {
      "command": "${NPM_PACKAGE}",
      "transport": "stdio"
    }
  }
}`;

const VSCODE_CONFIG = `{
  "servers": {
    "whatsapp": {
      "command": "${NPM_PACKAGE}",
      "transport": "stdio"
    }
  }
}`;

const CONFIG_FILES: ReadonlyArray<{ client: string; path: string; config: string }> = [
  {
    client: "Claude Code",
    path: "~/.claude.json",
    config: STDIO_CONFIG,
  },
  {
    client: "Claude Desktop",
    path: "~/Library/Application Support/Claude/claude_desktop_config.json",
    config: STDIO_CONFIG,
  },
  {
    client: "Cursor",
    path: "~/.cursor/mcp.json",
    config: STDIO_CONFIG,
  },
  {
    client: "VS Code",
    path: "~/Library/Application Support/Code/User/mcp.json",
    config: VSCODE_CONFIG,
  },
  {
    client: "Windsurf",
    path: "~/.codeium/windsurf/mcp_config.json",
    config: STDIO_CONFIG,
  },
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function codeBlock(code: string): string {
  return `<div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;color:#0f172a;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;line-height:1.5;white-space:pre;overflow-x:auto;">${escapeHtml(code)}</div>`;
}

function configRow(client: string, path: string, config: string): string {
  return `
          <tr>
            <td style="padding:0 32px 8px;color:#0f172a;font-size:14px;font-weight:600;line-height:1.4;">
              ${escapeHtml(client)}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 6px;color:#64748b;font-size:13px;line-height:1.5;">
              Edit <code style="background:#f1f5f9;border-radius:4px;padding:1px 5px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;color:#0f172a;">${escapeHtml(path)}</code> and add:
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 18px;">
              ${codeBlock(config)}
            </td>
          </tr>`;
}

function buildWelcomeEmailHtml(_email: string): string {
  const configBlocks = CONFIG_FILES.map(({ client, path, config }) =>
    configRow(client, path, config),
  ).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#06b6d4,#14b8a6);"></td>
          </tr>
          <tr>
            <td style="padding:32px 32px 0;">
              <span style="font-size:22px;font-weight:bold;color:#0f172a;">${BRAND}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 12px;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#0f172a;line-height:1.3;">
                Your install commands
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 18px;color:#475569;font-size:15px;line-height:1.6;">
              One npm install on macOS, then drop the JSON block into whichever MCP client you use. The server entry is identical across clients; only the config file path changes.
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 8px;color:#0f172a;font-size:14px;font-weight:600;line-height:1.4;">
              Step 1. Install the npm package
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 6px;color:#64748b;font-size:13px;line-height:1.5;">
              Run once in any terminal. The postinstall compiles the Swift binary in release mode (~30s on first install).
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              ${codeBlock(INSTALL_CMD)}
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 4px;color:#0f172a;font-size:14px;font-weight:600;line-height:1.4;">
              Step 2. Register the MCP server
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 12px;color:#64748b;font-size:13px;line-height:1.5;">
              Edit your client&rsquo;s MCP config file and add the snippet, then restart the app.
            </td>
          </tr>
          ${configBlocks}

          <tr>
            <td style="padding:4px 32px 18px;color:#64748b;font-size:13px;line-height:1.6;">
              Step 3. Grant Accessibility permission to the host app (Claude Desktop, Terminal, Cursor, etc.) under System Settings, Privacy &amp; Security, Accessibility. You can revoke it any time.
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px;">
              <a href="${GITHUB_URL}" style="display:inline-block;padding:11px 20px;background-color:#0f172a;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
                View source on GitHub
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 32px;color:#64748b;font-size:13px;line-height:1.6;">
              Hit a snag or want a feature? Just reply to this email, it goes straight to me.
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:20px 32px;color:#94a3b8;font-size:12px;line-height:1.5;">
              You&rsquo;re receiving this because you signed up at <a href="${SITE_URL}" style="color:#14b8a6;text-decoration:none;">whatsapp-mcp-macos.com</a>. Open source under <a href="${GITHUB_URL}" style="color:#14b8a6;text-decoration:none;">m13v/whatsapp-mcp-macos</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const POST = createNewsletterHandler({
  audienceId: process.env.RESEND_AUDIENCE_ID || "",
  fromEmail: FROM,
  brand: BRAND,
  siteUrl: SITE_URL,
  welcomeSubject: WELCOME_SUBJECT,
  welcomeHtml: buildWelcomeEmailHtml,
  onSignup: async (email, resendEmailId) => {
    if (!resendEmailId) return;
    try {
      const sql = getSql();
      await sql`
        INSERT INTO whatsappmcp_emails (resend_id, direction, from_email, to_email, subject, status)
        VALUES (${resendEmailId}, 'outbound', 'matt@whatsapp-mcp-macos.com', ${email}, ${WELCOME_SUBJECT}, 'sent')
        ON CONFLICT (resend_id) DO NOTHING
      `;
    } catch (err) {
      console.error("newsletter log error:", err);
    }
  },
});
