"use client";

import { trackScheduleClick } from "@seo/components";

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props?: Record<string, unknown>) => void;
    };
  }
}

export const BOOKING_URL = "https://cal.com/team/mediar/whatsapp-mcp";

export function trackBookingClick(opts: { section?: string; text?: string; component?: string }) {
  const page = typeof window !== "undefined" ? window.location.pathname : undefined;
  window.posthog?.capture("cta_click", {
    page,
    href: BOOKING_URL,
    text: opts.text,
    section: opts.section,
  });
  trackScheduleClick({
    destination: BOOKING_URL,
    site: "whatsapp-mcp-macos",
    section: opts.section,
    text: opts.text,
    component: opts.component ?? "BookCallLink",
  });
}
