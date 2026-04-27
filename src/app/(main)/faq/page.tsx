import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about the WhatsApp MCP server on macOS: how it works, ban risk, supported clients, and the differences vs the WhatsApp Business API or WhatsApp Web automation.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  {
    q: "What is an MCP server?",
    a: "Model Context Protocol is the open standard Anthropic shipped for letting LLMs call external tools. An MCP server runs on your machine, exposes a set of tools over stdio (or sse), and the AI client calls them when the model decides to. WhatsApp MCP exposes 11 tools that map to common WhatsApp actions — search contacts, open a chat, read messages, send a message, navigate UI.",
  },
  {
    q: "Why not the WhatsApp Business Cloud API?",
    a: "The Business Cloud API is the right tool for high-volume opt-in messaging from a verified sender (support inboxes, drip campaigns). It is the wrong tool for the personal-account use case this MCP serves: assistants that read your DMs, send the occasional message on your behalf, or bridge WhatsApp into a larger agent. The Business API requires Meta dev account approval, opt-in template review, and a verified phone number; this server runs against your existing personal account in seconds.",
  },
  {
    q: "Why not WhatsApp Web automation?",
    a: "WhatsApp Web automation has two structural problems: the DOM and selectors change frequently, breaking scrapers; and the messaging protocol is end-to-end encrypted, so live message capture requires reverse-engineering the crypto. This server sidesteps both by driving the official native macOS app through accessibility APIs — a public, stable interface that the OS exposes for screen readers and assistive tech.",
  },
  {
    q: "Will my account get banned?",
    a: "The risk is materially lower than browser-automation tools because there is no protocol-level traffic for Meta to fingerprint as automated. The OS sees a human-pattern click and keystroke stream. That said: any automation carries some risk. Don't use this to blast hundreds of unsolicited DMs or run mass-marketing flows — that's what the Business API is for, and it's also what gets accounts flagged.",
  },
  {
    q: "Does it work on Linux or Windows?",
    a: "No. The server depends on macOS Accessibility APIs and the macOS Catalyst build of WhatsApp. There is no equivalent path on Linux or Windows because the WhatsApp desktop apps on those platforms are Electron wrappers around WhatsApp Web, not the same accessibility-rich Catalyst app.",
  },
  {
    q: "Which MCP clients work?",
    a: "Any MCP-compatible client that supports stdio transport. Tested with Claude Desktop, Claude Code (CLI), Cursor, Windsurf. It also works embedded inside larger agents like Fazm. The server is transport-agnostic Swift; nothing about it is Claude-specific.",
  },
  {
    q: "Does it read past messages?",
    a: "It reads what's currently visible in the WhatsApp UI, the same way you would by scrolling. It does not query the encrypted message database directly. For older history, the assistant can be instructed to scroll up before reading.",
  },
  {
    q: "Is it open source?",
    a: "Yes. MIT-licensed, full source on GitHub at github.com/m13v/whatsapp-mcp-macos. The npm package is a thin wrapper that compiles the Swift binary at install time.",
  },
  {
    q: "How do I uninstall?",
    a: "npm uninstall -g whatsapp-mcp-macos removes the package and the compiled binary. Then remove the mcpServers entry from your client config and revoke the host app's Accessibility permission if you want a clean state.",
  },
  {
    q: "Can I sponsor the project or contribute?",
    a: "Yes — issues and PRs welcome on GitHub. If you want a private feature or integration help, book a call from the link in the header.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">FAQ</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
        Frequently asked questions
      </h1>
      <p className="mt-4 text-lg text-zinc-600">
        Everything we get asked over and over. If yours isn&rsquo;t here, open a GitHub issue or
        book 15 minutes.
      </p>

      <dl className="mt-10 divide-y divide-zinc-200 border-y border-zinc-200">
        {faqs.map((f) => (
          <div key={f.q} className="py-6">
            <dt className="text-base font-semibold text-zinc-900">{f.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-zinc-600">{f.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
