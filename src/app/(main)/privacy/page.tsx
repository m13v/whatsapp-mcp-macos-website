import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — WhatsApp MCP for macOS",
  description:
    "What WhatsApp MCP for macOS does and does not do with your data. Local-only execution, no telemetry by default, optional analytics on this marketing site.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Privacy</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
        Privacy at a glance
      </h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: 2026-04-27</p>

      <div className="prose prose-zinc mt-10 max-w-none">
        <h2 className="mt-8 text-lg font-semibold text-zinc-900">The MCP server itself</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          The WhatsApp MCP server runs entirely on your Mac. It reads the macOS Accessibility tree
          and synthesizes click and keystroke events to drive the official WhatsApp desktop app.
          Messages and contacts are read in-memory by your AI client and never routed through any
          server we operate. We have no telemetry, no &ldquo;phone home&rdquo; ping, and no
          installer-side analytics.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-zinc-900">This marketing website</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          The site you&rsquo;re reading uses PostHog (anonymized pageviews, button clicks) to
          understand which guides are useful, and Resend for the optional newsletter and contact
          form. If you book a call through Cal.com, your name, email, and timezone go to Cal.com so
          we can put a meeting on the calendar.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-zinc-900">What we don&rsquo;t do</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-600">
          <li>We don&rsquo;t sell your data.</li>
          <li>We don&rsquo;t share newsletter subscribers with anyone.</li>
          <li>We don&rsquo;t fingerprint or cross-site track you.</li>
        </ul>

        <h2 className="mt-8 text-lg font-semibold text-zinc-900">Contact</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Privacy questions: <a href="mailto:hello@whatsapp-mcp-macos.com" className="text-teal-700 hover:text-teal-800">hello@whatsapp-mcp-macos.com</a>.
          Data deletion requests, same address.
        </p>
      </div>
    </div>
  );
}
