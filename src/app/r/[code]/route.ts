import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RESOLVER_BASE = (
  process.env.SHORT_LINK_RESOLVER_URL || "https://app.s4l.ai"
).replace(/\/+$/, "");

const ALLOWED_TARGET_HOSTS = new Set([
  "whatsapp-mcp-macos.com",
  "www.whatsapp-mcp-macos.com",
  "github.com",
  "www.github.com",
  "npmjs.com",
  "www.npmjs.com",
  "cal.com",
  "www.cal.com",
]);

const BOT_UA_RE =
  /bot|crawler|spider|Twitterbot|LinkedInBot|Slackbot|facebookexternalhit|Discordbot|TelegramBot|WhatsApp|Applebot|Googlebot|Bingbot|YandexBot|DuckDuckBot|redditbot|Pinterest|Embedly|Snapchat|axios\/|python-requests|python-urllib|node-fetch|^node$|curl\//i;

function getHomeUrl(req: NextRequest): string {
  const fwdHost =
    req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const fwdProto =
    req.headers.get("x-forwarded-proto") ||
    (fwdHost && !fwdHost.includes("localhost") ? "https" : "http");

  if (fwdHost && !/(?:^|\.)0\.0\.0\.0(?::\d+)?$/.test(fwdHost)) {
    return `${fwdProto}://${fwdHost}/`;
  }

  return new URL("/", req.url).toString();
}

function allowedTarget(target: string): string | null {
  try {
    const url = new URL(target);
    if (url.protocol !== "https:") return null;
    if (!ALLOWED_TARGET_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await ctx.params;
  const code = (rawCode || "").trim();
  const homeUrl = getHomeUrl(req);

  if (!/^[a-z0-9]{4,32}$/i.test(code)) {
    return Response.redirect(homeUrl, 302);
  }

  const ua = req.headers.get("user-agent") || "";
  const referrer = req.headers.get("referer") || "";
  const params = new URLSearchParams();
  if (!ua || BOT_UA_RE.test(ua)) params.set("bot", "1");
  if (ua) params.set("ua", ua.slice(0, 500));
  if (referrer) params.set("ref", referrer.slice(0, 500));

  try {
    const qs = params.toString();
    const resp = await fetch(
      `${RESOLVER_BASE}/api/short-links/${encodeURIComponent(code)}${qs ? `?${qs}` : ""}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      },
    );

    if (resp.ok) {
      const body = (await resp.json()) as { target_url?: string };
      if (body.target_url) {
        const target = allowedTarget(body.target_url);
        if (target) {
          return Response.redirect(target, 302);
        }
        console.warn("[short-link] blocked disallowed target:", body.target_url);
      }
    }
  } catch (err) {
    console.error("[short-link] resolver fetch failed:", err);
  }

  return Response.redirect(homeUrl, 302);
}
