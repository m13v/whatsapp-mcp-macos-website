"use client";

import { trackGetStartedClick } from "@seo/components";

export const GET_STARTED_URL = "https://whatsapp-mcp-macos.com/install";
export const NPM_PACKAGE = "whatsapp-mcp-macos";
export const NPM_INSTALL_CMD = `npm install -g ${NPM_PACKAGE}`;
export const GITHUB_URL = "https://github.com/m13v/whatsapp-mcp-macos";

export function fireGetStartedClick(opts: { section?: string; text?: string; component?: string; destination?: string }) {
  trackGetStartedClick({
    destination: opts.destination ?? GET_STARTED_URL,
    site: "whatsapp-mcp-macos",
    section: opts.section,
    text: opts.text,
    component: opts.component ?? "GetStartedLink",
  });
}
