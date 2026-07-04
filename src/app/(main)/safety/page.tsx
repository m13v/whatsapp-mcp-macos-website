import type { Metadata } from "next";
import Link from "next/link";
import { GITHUB_URL, NPM_INSTALL_CMD } from "@/lib/project-links";

export const metadata: Metadata = {
  title: "Safety",
  description:
    "Safety and verification notes for WhatsApp MCP for macOS: independent project, no WhatsApp password or QR-code collection, open-source install, and revocable macOS permissions.",
  alternates: { canonical: "/safety" },
};

const checks = [
  {
    title: "Independent project",
    body:
      "WhatsApp MCP for macOS is not affiliated with, endorsed by, or sponsored by WhatsApp LLC or Meta Platforms. The name describes interoperability with the WhatsApp desktop app.",
  },
  {
    title: "No credential collection",
    body:
      "The server never asks for your WhatsApp password, QR code, Meta credentials, payment details, browser cookies, session files, or recovery codes.",
  },
  {
    title: "Local-only operation",
    body:
      "The MCP server runs as a local stdio process on your Mac. It uses macOS Accessibility APIs to read and operate the WhatsApp desktop window that is already signed in.",
  },
  {
    title: "Revocable permission",
    body:
      "The only system permission involved is Accessibility for the host app that launches the MCP server. You can revoke it any time in System Settings.",
  },
];

const installConfig = `{
  "mcpServers": {
    "whatsapp": {
      "command": "whatsapp-mcp-macos",
      "transport": "stdio"
    }
  }
}`;

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Safety</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
        How to verify WhatsApp MCP for macOS
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-600">
        This page is here so users, security reviewers, and browser protection systems can quickly
        see what the project does and what it does not do.
      </p>

      <div className="mt-10 grid gap-4">
        {checks.map((item) => (
          <section key={item.title} className="rounded-lg border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold text-zinc-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Public install command</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          The install command is public. You do not need to enter an email address to install or
          inspect the project.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-900">
          <code>{NPM_INSTALL_CMD}</code>
        </pre>
        <pre className="mt-4 overflow-x-auto rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-900">
          <code>{installConfig}</code>
        </pre>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-zinc-900">Source and package verification</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-600">
          <li>
            Source code:{" "}
            <a href={GITHUB_URL} className="font-medium text-teal-700 hover:text-teal-800">
              github.com/m13v/whatsapp-mcp-macos
            </a>
          </li>
          <li>
            npm package name:{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800">
              whatsapp-mcp-macos
            </code>
          </li>
          <li>
            Privacy details:{" "}
            <Link href="/privacy" className="font-medium text-teal-700 hover:text-teal-800">
              /privacy
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-12 rounded-lg border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-950">Use it responsibly</h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-950">
          This is a personal automation tool for your own signed-in desktop app. Do not use it for
          unsolicited bulk messaging, impersonation, or bypassing WhatsApp or Meta policies.
        </p>
      </section>
    </div>
  );
}
