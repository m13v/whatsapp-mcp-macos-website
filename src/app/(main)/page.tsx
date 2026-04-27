import type { Metadata } from "next";
import Link from "next/link";
import { BookCallLink } from "@/components/BookCallLink";
import { GetStartedLink } from "@/components/GetStartedLink";
import { GITHUB_URL, NPM_INSTALL_CMD } from "@/lib/get-started";

export const metadata: Metadata = {
  title: "WhatsApp MCP for macOS — drive WhatsApp from Claude, Cursor, or any MCP client",
  description:
    "Open-source MCP server that lets AI assistants search contacts, send messages, and read chats in the native WhatsApp desktop app on macOS. No Meta Business API. No browser automation.",
  alternates: { canonical: "/" },
};

const features = [
  {
    title: "Native macOS, no Web API",
    body:
      "Drives the official WhatsApp Catalyst app through accessibility APIs and CGEvent input. No Meta Business API keys, no Selenium, no QR-code scraping.",
  },
  {
    title: "11 MCP tools, stdio transport",
    body:
      "Search contacts, open chats, read messages, send text, navigate the app. Plug into Claude Desktop, Claude Code, Cursor, Windsurf, or any MCP-compatible client.",
  },
  {
    title: "Single npm install",
    body:
      "One command. Postinstall compiles the Swift binary; the MCP server registers via stdio in your client config. No Docker, no daemons.",
  },
  {
    title: "Local and private",
    body:
      "Runs entirely on your Mac. Messages stay in WhatsApp; nothing routes through third-party infrastructure. You control the accessibility permission.",
  },
];

const steps = [
  {
    n: "01",
    title: "Install the npm package",
    body: "npm install -g whatsapp-mcp-macos. The postinstall script compiles the Swift binary in release mode.",
  },
  {
    n: "02",
    title: "Grant Accessibility permission",
    body: "System Settings → Privacy & Security → Accessibility, enable the host app (Claude Desktop, Terminal, Fazm, etc.).",
  },
  {
    n: "03",
    title: "Register the MCP server",
    body: "Add a single mcpServers entry to ~/.claude.json or your client's config. Restart the client.",
  },
  {
    n: "04",
    title: "Talk to WhatsApp from your AI",
    body: '"Send Mom my flight info" — your assistant searches contacts, opens the chat, and drafts the message in WhatsApp.',
  },
];

const faqs = [
  {
    q: "Does this use the WhatsApp Business API?",
    a: "No. It drives the native macOS WhatsApp desktop app through accessibility APIs. There are no Meta API keys, no webhook setup, no opt-in template approval. The tradeoff: it's a personal-account automation tool, not a high-volume broadcast pipeline.",
  },
  {
    q: "Is this open source?",
    a: "Yes. Full source is on GitHub at github.com/m13v/whatsapp-mcp-macos. The MCP server is written in Swift; the npm package compiles it during postinstall.",
  },
  {
    q: "What about WhatsApp Web?",
    a: "WhatsApp Web automation breaks on every layout update and requires reverse-engineering the encrypted protocol. This project sidesteps both by driving the official Catalyst app's accessibility tree, which is stable across WhatsApp releases.",
  },
  {
    q: "Will my account get banned?",
    a: "Risk is materially lower than browser-automation approaches because there is no protocol-level traffic to fingerprint — the OS treats this like a human clicking and typing. That said, automation always carries some risk; don't blast hundreds of unsolicited messages.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "WhatsApp MCP for macOS",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS 13+",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      url: "https://whatsapp-mcp-macos.com",
      sameAs: [GITHUB_URL],
      description:
        "MCP server that drives the native WhatsApp desktop app on macOS through accessibility APIs.",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
            Open source · macOS · MCP
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            WhatsApp, controlled by your AI assistant.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600">
            An MCP server that lets Claude, Cursor, or any MCP client search contacts, send
            messages, and read chats in the native WhatsApp desktop app on macOS. No Meta Business
            API. No browser automation. One npm install.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-800">
              <span className="select-none text-zinc-400">$</span>
              <span className="ml-2">{NPM_INSTALL_CMD}</span>
            </code>
            <GetStartedLink
              href="/install"
              section="hero"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Install instructions
            </GetStartedLink>
            <BookCallLink
              section="hero"
              className="inline-flex items-center justify-center rounded-md border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-400"
            >
              Book a call
            </BookCallLink>
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            macOS 13+ · WhatsApp desktop app · Accessibility permission
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-zinc-100 bg-zinc-50/40">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            What you get
          </h2>
          <div className="mt-10 grid gap-px bg-zinc-200 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="bg-white p-6">
                <h3 className="text-base font-semibold text-zinc-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n}>
                <p className="font-mono text-xs text-teal-600">{s.n}</p>
                <h3 className="mt-2 text-base font-semibold text-zinc-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <GetStartedLink
              href="/install"
              section="how-it-works"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Install
            </GetStartedLink>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-400"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-zinc-100 bg-zinc-50/40">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Common questions
          </h2>
          <dl className="mt-8 divide-y divide-zinc-200 border-y border-zinc-200">
            {faqs.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="text-base font-semibold text-zinc-900">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-zinc-600">{f.a}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <Link
              href="/faq"
              className="text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              See full FAQ →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Give your AI a real messaging tool.
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            One install. One config block. Your assistant talks to WhatsApp like you do.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GetStartedLink
              href="/install"
              section="final-cta"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Install for Mac
            </GetStartedLink>
            <BookCallLink
              section="final-cta"
              className="inline-flex items-center justify-center rounded-md border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-400"
            >
              Book a call with the maintainer
            </BookCallLink>
          </div>
        </div>
      </section>
    </>
  );
}
