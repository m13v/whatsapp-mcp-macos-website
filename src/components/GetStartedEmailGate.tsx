"use client";

import { InstallEmailGate } from "@seo/components";
import { GITHUB_URL, NPM_INSTALL_CMD, NPM_PACKAGE } from "@/lib/get-started";

const STORAGE_KEY = "whatsapp_mcp_install_email_captured";

const CLAUDE_CONFIG = `{
  "mcpServers": {
    "whatsapp": {
      "command": "${NPM_PACKAGE}",
      "transport": "stdio"
    }
  }
}`;

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
      command={NPM_INSTALL_CMD}
      configBlock={{ label: "Add to your MCP client config", code: CLAUDE_CONFIG }}
      site="whatsapp-mcp-macos"
      section={section}
      label={label}
      variant={variant}
      className={className}
      storageKey={STORAGE_KEY}
      githubUrl={GITHUB_URL}
      modalTitle="Get the install command"
      modalDescription="Drop your email and we'll show you the one-line install plus the occasional update. No spam."
      commandTitle="Run this on your Mac"
      commandDescription="macOS 13+, with the WhatsApp desktop app installed. Postinstall compiles the Swift binary."
      commandFooter={
        <>
          Drop the JSON into <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px]">~/.claude.json</code>{" "}
          (Claude Code) or your client&apos;s equivalent, then restart the client. Grant
          Accessibility permission to the host app on first run.
        </>
      }
    />
  );
}
