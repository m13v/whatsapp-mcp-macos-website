"use client";

import { trackGetStartedClick } from "@seo/components";
import { GET_STARTED_URL } from "@/lib/project-links";

export { GET_STARTED_URL, NPM_PACKAGE, NPM_INSTALL_CMD, GITHUB_URL } from "@/lib/project-links";

export function fireGetStartedClick(opts: { section?: string; text?: string; component?: string; destination?: string }) {
  trackGetStartedClick({
    destination: opts.destination ?? GET_STARTED_URL,
    site: "whatsapp-mcp-macos",
    section: opts.section,
    text: opts.text,
    component: opts.component ?? "GetStartedLink",
  });
}
