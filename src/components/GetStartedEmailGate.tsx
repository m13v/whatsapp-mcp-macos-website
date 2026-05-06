"use client";

import { InstallEmailGate } from "@seo/components";
import { GITHUB_URL, NPM_INSTALL_CMD } from "@/lib/get-started";

const STORAGE_KEY = "whatsapp_mcp_install_email_captured";

export function GetStartedEmailGate({
  label = "Get the install command",
  section = "hero",
  className = "",
  variant = "primary",
}: {
  label?: string;
  section?: string;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <InstallEmailGate
      // command is required by the prop type but is never shown in emailOnly
      // mode. The actual install snippets are delivered via the welcome email
      // built in src/app/api/newsletter/route.ts.
      command={NPM_INSTALL_CMD}
      site="whatsapp-mcp-macos"
      section={section}
      label={label}
      variant={variant}
      className={className}
      storageKey={STORAGE_KEY}
      githubUrl={GITHUB_URL}
      modalTitle="Get the install command"
      modalDescription="Drop your email and we'll send the one-line install plus configs for every MCP client. No spam."
      submitLabel="Email me the install"
      emailOnly
      sentTitle="Install command sent"
      sentDescription={(email) => (
        <>
          Sent to <span className="font-medium text-zinc-900">{email}</span>.
          Open your inbox to grab the install for Claude Code, Claude Desktop,
          Cursor, VS Code, and Windsurf. If you don&apos;t see it in a minute,
          check spam or promotions.
        </>
      )}
    />
  );
}
