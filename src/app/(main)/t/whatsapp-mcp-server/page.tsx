import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  BackgroundGrid,
  GradientText,
  ShimmerButton,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  SequenceDiagram,
  GlowCard,
  StepTimeline,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@seo/components";

const PAGE_URL = "https://whatsapp-mcp-macos.com/t/whatsapp-mcp-server";
const PUBLISHED = "2026-05-19";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "WhatsApp MCP server: four ways one exists, and how to pick the right one",
  description:
    "A WhatsApp MCP server exposes WhatsApp as JSON-RPC tools an AI can call. The four real implementations differ in HOW they reach WhatsApp: Business Cloud API, whatsmeow web-multidevice, headless WhatsApp Web, or macOS accessibility. Side-by-side, with the failure modes each one hides.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "WhatsApp MCP server: four ways one exists",
    description:
      "Business Cloud API vs whatsmeow vs headless WhatsApp Web vs macOS accessibility. The one feature no other server documents: post-send delivery verification by re-walking the AX tree.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp MCP server: four ways one exists",
    description:
      "Four real mechanisms behind every WhatsApp MCP. What each one trades off, and the verification step nobody documents.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "WhatsApp MCP server" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "WhatsApp MCP server", url: PAGE_URL },
];

const mcpConfigCode = `// ~/.claude.json   (or your MCP client's equivalent)
{
  "mcpServers": {
    "whatsapp": {
      "type": "stdio",
      "command": "whatsapp-mcp",
      "args": [],
      "env": {}
    }
  }
}`;

const verificationCode = `// Sources/WhatsAppMCP/main.swift, line 920 to 957
pressReturn()
Thread.sleep(forTimeInterval: 1.0)

// Post-send verification: re-walk the AX tree looking for the bubble we
// just produced. WhatsApp Catalyst exposes outgoing messages as an
// AXGenericElement whose description is literally "Your message, <text>, 12:04 PM".
let postElements = traverseAXTree(pid: pid)
let genericElements = findElements(in: postElements, role: "AXGenericElement")

var lastSentMessage: String? = nil
for el in genericElements {
    let desc = cleanUnicode(el.description ?? "")
    if desc.hasPrefix("Your message, ") {
        let rest = String(desc.dropFirst("Your message, ".count))
        var text = rest
        // Strip the trailing ", 12:04 PM" timestamp.
        if let r = text.range(of: #",\\s+\\d{1,2}:\\d{2}\\s*[APap][Mm]"#,
                              options: .regularExpression) {
            text = String(text[text.startIndex..<r.lowerBound])
        }
        lastSentMessage = text.trimmingCharacters(in: CharacterSet(charactersIn: ", "))
    }
}

let verified: Bool
if let lastSent = lastSentMessage {
    let sentNormalized = lastSent.lowercased().trimmingCharacters(in: .whitespaces)
    let msgNormalized  = message.lowercased().trimmingCharacters(in: .whitespaces)
    verified = sentNormalized.hasPrefix(msgNormalized)
        || msgNormalized.hasPrefix(sentNormalized)
        || sentNormalized.contains(msgNormalized)
} else {
    verified = false
}

return verified
    ? "{\\"success\\": true, \\"verified\\": true, ...}"
    : "{\\"success\\": true, \\"verified\\": false, \\"warning\\": ...}"`;

const installLines = [
  { type: "command" as const, text: "npm install -g whatsapp-mcp-macos" },
  {
    type: "info" as const,
    text: "postinstall: xcrun swift build -c release",
  },
  {
    type: "output" as const,
    text: "Build complete! .build/release/whatsapp-mcp",
  },
  {
    type: "command" as const,
    text: "# add to ~/.claude.json under mcpServers.whatsapp (env: {})",
  },
  { type: "command" as const, text: "# restart Claude Code, run /mcp" },
  {
    type: "success" as const,
    text: "log: setupAndStartServer: defined 11 tools",
  },
];

const taxonomyRows = [
  {
    feature: "Business Cloud API",
    competitor:
      "Talks to graph.facebook.com on the user's behalf. The MCP holds an access token, a phone number ID, and a webhook URL. Examples: Infobip MCP, Zapier WhatsApp Business Messaging, most listings on mcpmarket.com.",
    ours:
      "Native B2B path. Requires a Meta developer account, business verification, message templates, and per-conversation pricing. The MCP itself is a thin HTTP client. You can broadcast to opted-in template lists but you cannot initiate freeform chats outside the 24-hour window.",
  },
  {
    feature: "whatsmeow / web-multidevice",
    competitor:
      "Embeds a Go bridge that speaks the reverse-engineered WhatsApp Web multidevice protocol. Scans a QR inside the MCP and stores its own session. Examples: lharries/whatsapp-mcp, several Show HN entries.",
    ours:
      "No Meta account, but the MCP becomes a linked device, and Meta has historically banned accounts that misbehave on this protocol. The MCP stores all of your messages in a local SQLite DB so the model can grep them. Powerful, but the MCP IS your auth, if the bridge process dies the linked device is gone.",
  },
  {
    feature: "Headless WhatsApp Web",
    competitor:
      "Drives web.whatsapp.com in a Playwright or Puppeteer Chromium. Examples: fyimail/whatsapp-mcp2 and similar entries on Awesome MCP Servers.",
    ours:
      "Same linked-device footprint as whatsmeow, plus a browser process you have to keep alive and a DOM you have to scrape. Selectors break every time WhatsApp Web ships. Cloudflare and bot-detection signals are still WhatsApp's call.",
  },
  {
    feature: "macOS accessibility (this server)",
    competitor:
      "Binds to the running WhatsApp Desktop process by bundle id net.whatsapp.WhatsApp and drives it through AXUIElement, the same framework VoiceOver uses. Source: github.com/m13v/whatsapp-mcp-macos.",
    ours:
      "No Meta account, no QR pairing in the MCP, no linked-device slot consumed. The auth IS whatever WhatsApp Desktop is signed in as. macOS only. The MCP cannot run if the desktop app is not installed and signed in.",
  },
];

const mechanismActors = [
  "AI client",
  "MCP host",
  "MCP server",
  "WhatsApp",
];

const businessApiMessages = [
  { from: 0, to: 1, label: "tool_call: send_message(to, body)", type: "request" as const },
  { from: 1, to: 2, label: "spawn stdio child", type: "event" as const },
  { from: 2, to: 3, label: "POST /v17.0/<phone_id>/messages  (Bearer token)", type: "request" as const },
  { from: 3, to: 2, label: "200 { messages: [ { id } ] }", type: "response" as const },
  { from: 2, to: 1, label: "tool_result: { id, status: queued }", type: "response" as const },
  { from: 3, to: 2, label: "later: webhook POST /your-https-endpoint", type: "event" as const },
];

const accessibilityMessages = [
  { from: 0, to: 1, label: "tool_call: whatsapp_send_message(text)", type: "request" as const },
  { from: 1, to: 2, label: "spawn stdio child", type: "event" as const },
  { from: 2, to: 3, label: "traverseAXTree(pid), find compose textarea", type: "request" as const },
  { from: 3, to: 2, label: "AXTextArea, x, y, w, h", type: "response" as const },
  { from: 2, to: 3, label: "clickAt + paste + CGEvent Return", type: "request" as const },
  { from: 2, to: 3, label: "re-traverse: find AXGenericElement 'Your message, ...'", type: "request" as const },
  { from: 3, to: 2, label: "matched, verified: true", type: "response" as const },
  { from: 2, to: 1, label: "tool_result: { success: true, verified: true }", type: "response" as const },
];

const toolList = [
  {
    title: "whatsapp_status",
    description:
      "Checks both that WhatsApp is running AND that accessibility is functionally working. Does a real probe, because AXIsProcessTrustedWithOptions can return true while AX calls silently fail on a stale TCC cache.",
  },
  {
    title: "whatsapp_start / whatsapp_quit",
    description:
      "Launches via /usr/bin/open -a WhatsApp.app, or terminates the running net.whatsapp.WhatsApp process. The quit handler falls back to forceTerminate() after a 5-second graceful window.",
  },
  {
    title: "whatsapp_list_chats",
    description:
      "Walks the sidebar collection of AX elements, parses unread counts and last-message previews. Filter parameter accepts all, unread, favorites, or groups.",
  },
  {
    title: "whatsapp_search",
    description:
      "Types the query into the search field and parses the AX tree into a structured list with section (chats vs contacts), contactName, preview, and time. Leaves search OPEN, returns indexed results.",
  },
  {
    title: "whatsapp_open_chat",
    description:
      "Clicks the Nth search result. Returns the chat name that actually opened, so the agent can verify it matched before sending.",
  },
  {
    title: "whatsapp_scroll_search",
    description:
      "Scrolls within the search results list. Use when the contact you want is not in the first batch.",
  },
  {
    title: "whatsapp_read_messages",
    description:
      "Parses messages from the currently open chat. Returns sender, text, time, and isFromMe. Cannot fetch messages from chats that are not open: the AX tree only shows what is rendered.",
  },
  {
    title: "whatsapp_send_message",
    description:
      "Pastes the text into the compose textarea (via clipboard, then Cmd+V), presses Return, then re-walks the AX tree to verify the bubble appeared. Returns verified: true or false.",
  },
  {
    title: "whatsapp_get_active_chat",
    description:
      "Returns the name, subtitle, and recent messages of whatever chat is currently focused. Used between open_chat and send_message to confirm targeting.",
  },
  {
    title: "whatsapp_navigate",
    description:
      "Switches tabs: chats, calls, updates, settings, archived, starred. Implemented as a Cmd+digit key combination via CGEvent.",
  },
];

const setupSteps = [
  {
    title: "Install WhatsApp Desktop and sign in",
    description:
      "From the Mac App Store. One-time QR pair with your phone. This pairing lives inside WhatsApp Desktop's session storage, not inside the MCP. If you sign out of the desktop app, the MCP loses its target.",
  },
  {
    title: "Install the MCP server from npm",
    description:
      "npm install -g whatsapp-mcp-macos. The postinstall script runs xcrun swift build -c release and drops a Swift binary at .build/release/whatsapp-mcp. The npm bin wires whatsapp-mcp onto your PATH.",
  },
  {
    title: "Add the server to your MCP host config",
    description:
      "type: stdio, command: whatsapp-mcp, args: [], env: {}. The empty env block is not a typo. The MCP layer carries zero secrets.",
  },
  {
    title: "Grant macOS Accessibility to the host",
    description:
      "System Settings > Privacy & Security > Accessibility. Grant to the process that forks the MCP child. That's Claude.app if you launch from /Applications, Cursor if you launch from Cursor, Terminal if you test from the shell.",
  },
  {
    title: "Restart the host, run /mcp",
    description:
      "First tool call surfaces the Accessibility prompt if it is not yet granted. Then whatsapp_status will return accessibilityTrusted: true and accessibilityWorking: true if both checks pass.",
  },
];

const faqItems = [
  {
    q: "What is a WhatsApp MCP server?",
    a: "It is a process that implements the Model Context Protocol, exposing WhatsApp as a set of JSON-RPC tools an AI assistant (Claude, Cursor, Windsurf, any MCP-aware client) can call. Typical tools are list_chats, search_contact, read_messages, and send_message. The server is just a child process the host forks and talks to over stdio (or sometimes HTTP+SSE). What varies between implementations is HOW the server actually reaches WhatsApp: Meta's Business Cloud API, the reverse-engineered web-multidevice protocol, browser automation against WhatsApp Web, or macOS accessibility against the native desktop app.",
  },
  {
    q: "Why are there four different kinds of WhatsApp MCP server?",
    a: "WhatsApp does not ship one canonical API for an LLM to use. The Business Cloud API exists and is fully supported but requires a Meta developer account, business verification, message templates, and a public webhook, which is wrong for a personal use case. The web-multidevice protocol (whatsmeow) is reverse-engineered from the WhatsApp Web client and works personally but the MCP becomes a linked device that can be revoked. Headless WhatsApp Web has the same linked-device footprint plus a fragile DOM. macOS accessibility drives the genuine desktop app and the auth is just whoever you are signed in to. Each one trades off the same three things differently: who owns the auth, who owns the rate-limit risk, and what platforms it runs on.",
  },
  {
    q: "Which WhatsApp MCP server should I pick?",
    a: "If you are building a B2B product that needs verified-sender broadcasts to opted-in lists, use a Business Cloud API server (Infobip, Zapier, mcpmarket). If you are on Linux or Windows and want personal reach, use lharries/whatsapp-mcp (whatsmeow) and accept that the MCP IS your linked device. If you are on macOS and want personal reach without burning a linked-device slot or storing a Meta token, use whatsapp-mcp-macos. The single biggest selection factor is whether you can tolerate the MCP layer holding credentials. The accessibility path is the only one where the answer is no, because there are no credentials at the MCP layer.",
  },
  {
    q: "What is the unique thing the macOS accessibility server does that the others don't?",
    a: "Post-send delivery verification by re-traversing the accessibility tree. After it pastes text and posts a Return CGEvent, it walks the AX tree a second time, filters for elements with role AXGenericElement whose description starts with the literal string 'Your message, ', strips the time suffix with a regex, lowercases and trims, then prefix-matches the sent text. If the match holds, the tool returns verified: true. If it does not, the tool returns success: true, verified: false with a warning containing the last sent message it found. The Business API path returns 'queued' and tells you to wait for a webhook. The whatsmeow path returns its internal message ID. Neither one re-reads the conversation to confirm the bubble actually rendered. See main.swift lines 923 to 957 in github.com/m13v/whatsapp-mcp-macos.",
  },
  {
    q: "Does the server need a Meta developer account or a WhatsApp Business account?",
    a: "Only if you choose the Business Cloud API path. The whatsmeow path needs neither. The macOS accessibility path needs neither and additionally does not consume a linked-device slot, because it drives WhatsApp Desktop in-process rather than registering as a separate web client. If you check the env block of the recommended config (mcpServers.whatsapp.env) it is literally an empty object. There is nothing to rotate, revoke, or leak.",
  },
  {
    q: "How does the MCP host actually talk to the server?",
    a: "JSON-RPC over stdio. The host (Claude Code, Cursor, etc.) forks the child process named in your config and reads JSON-RPC messages from the child's stdout while writing to its stdin. There is no port, no socket, no TLS, no HTTPS. The host calls initialize, then tools/list to learn what the server exposes, then tools/call for each tool invocation. The macOS server here defines 11 tools in setupAndStartServer (main.swift line 990). If you have ever wired up another stdio MCP, the shape is identical, the difference is what each tool does internally.",
  },
  {
    q: "What permission does the macOS accessibility server actually need?",
    a: "Exactly one: macOS Accessibility, granted to the host process that forks the MCP child. If you launch Claude Code from /Applications/Claude.app, you grant Accessibility to Claude. If you launch Cursor, you grant it to Cursor. If you test from Terminal, you grant it to Terminal. The check is at main.swift line 562. There is also a functional probe at line 576, because AXIsProcessTrustedWithOptions can return true while the TCC database is stale and AX calls silently return nil. whatsapp_status reports both: accessibilityTrusted is the cached TCC answer, accessibilityWorking is whether a real AX read just succeeded.",
  },
  {
    q: "What are the honest limits of an accessibility-based WhatsApp MCP server?",
    a: "Three honest limits. First, the server can only see what is rendered: if a chat has not been opened, its messages are not in the AX tree and whatsapp_read_messages cannot fetch arbitrary history. Second, text only: the send tool pastes text into the compose textarea; it does not handle images, files, voice notes, or video, because the AX-level paste pathway does not carry attachments. Third, single window assumption: the tree parser uses x-coordinate thresholds to separate sidebar from chat panel, which depends on the standard layout. Plus the visible cursor briefly moves and the clipboard is briefly overwritten before being restored. If any of those constraints are deal breakers, the Business API or whatsmeow paths are the right choice instead.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "WhatsApp MCP server: four ways one exists, and how to pick the right one",
    description:
      "A WhatsApp MCP server exposes WhatsApp as JSON-RPC tools an AI can call. The four real implementations differ in HOW they reach WhatsApp: Business Cloud API, whatsmeow web-multidevice, headless WhatsApp Web, or macOS accessibility.",
    url: PAGE_URL,
    datePublished: PUBLISHED,
    author: "Matthew Diakonov",
    authorUrl: "https://m13v.com",
    publisherName: "WhatsApp MCP for macOS",
    publisherUrl: "https://whatsapp-mcp-macos.com",
    articleType: "TechArticle",
  }),
  breadcrumbListSchema(breadcrumbSchemaItems),
  faqPageSchema(faqItems),
];

export default function WhatsappMcpServerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="pb-24">
        <div className="max-w-4xl mx-auto px-6 pt-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <BackgroundGrid glow className="mx-4 md:mx-8 mt-6 px-6 py-14 md:py-20">
          <div className="max-w-4xl mx-auto relative z-10">
            <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
              guide / mechanism explainer
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.1]">
              <GradientText>WhatsApp MCP server.</GradientText>{" "}
              Four ways one exists, and how to pick the right one.
            </h1>
            <p className="text-base md:text-lg text-zinc-700 mb-5 max-w-2xl">
              Every &ldquo;WhatsApp MCP&rdquo; you find on GitHub does the same
              thing at the protocol layer: it serves JSON-RPC over stdio and
              advertises tools like <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">send_message</code> and{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">list_chats</code>. What
              actually differs is the bottom edge: how the server reaches
              WhatsApp itself. There are four real choices, and the trade-offs
              between them decide everything else.
            </p>
            <p className="text-sm md:text-base text-zinc-600 mb-8 max-w-2xl">
              This guide walks all four. The last section is the one feature
              nobody else documents: post-send delivery verification by
              re-walking the accessibility tree.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#install">
                Install the macOS server
              </ShimmerButton>
              <a
                href="https://github.com/m13v/whatsapp-mcp-macos"
                className="text-sm font-medium text-teal-700 hover:text-teal-600"
              >
                source on GitHub &rarr;
              </a>
            </div>
          </div>
        </BackgroundGrid>

        <div className="mt-8">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="10 min read"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 mt-12">
          <GlowCard>
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-teal-700 mb-3">
                Direct answer, verified 2026-05-19
              </p>
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mb-4">
                What is a WhatsApp MCP server, in one paragraph
              </h2>
              <p className="text-zinc-700 leading-relaxed mb-3">
                It&rsquo;s a server that implements the Model Context Protocol
                and exposes WhatsApp as a set of JSON-RPC tools an AI assistant
                can call: search contacts, list chats, read messages, send
                messages, navigate tabs. The MCP host (Claude Code, Cursor,
                Windsurf) forks the server as a stdio child process. The four
                common implementations differ in HOW they reach WhatsApp:
                Meta&rsquo;s <strong>Business Cloud API</strong>, the
                reverse-engineered <strong>web-multidevice protocol</strong>{" "}
                (whatsmeow), browser automation against{" "}
                <strong>WhatsApp Web</strong>, or native{" "}
                <strong>macOS accessibility APIs</strong> against the desktop
                app.
              </p>
              <p className="text-zinc-600 text-sm">
                Authoritative source for the macOS variant cited throughout:{" "}
                <a
                  href="https://github.com/m13v/whatsapp-mcp-macos"
                  className="text-teal-700 hover:text-teal-600 underline"
                >
                  github.com/m13v/whatsapp-mcp-macos
                </a>
                . Specific files referenced:{" "}
                <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">Sources/WhatsAppMCP/main.swift</code>{" "}
                and{" "}
                <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">package.json</code>.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            The protocol is identical. The mechanism is everything.
          </h2>
          <p className="text-zinc-700 mb-4">
            MCP is a thin envelope. The host forks a child process, asks{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">tools/list</code>, and
            then sends <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">tools/call</code>{" "}
            for each invocation. That part is boring and the same across every
            server you have ever seen. What changes between implementations is
            what the server actually does when{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">send_message</code> arrives.
            The four common answers, in order from most-corporate to
            most-OS-native:
          </p>

          <ComparisonTable
            productName="The server you're looking at"
            competitorName="What it actually does at the bottom edge"
            rows={taxonomyRows}
          />

          <p className="text-zinc-600 text-sm mt-6">
            Three things decide which row is right for your project: who owns
            the auth (you, Meta, or the desktop app), who owns the
            rate-limit-and-ban risk, and which platforms you need to support.
            If you cannot tolerate the MCP holding credentials, the bottom row
            is the only one where it does not.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            What a Business Cloud API server looks like on the wire
          </h2>
          <p className="text-zinc-700 mb-6">
            Most public &ldquo;WhatsApp MCP&rdquo; listings on directories like
            mcpmarket and Zapier are this. The MCP is a thin shell over an
            HTTPS POST to <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">graph.facebook.com/v17.0/&lt;phone_number_id&gt;/messages</code>.
            The MCP holds a long-lived Meta access token. The send is
            asynchronous: you get a queued message ID immediately, and the
            actual &ldquo;delivered&rdquo; signal arrives later as a webhook
            POST to a public HTTPS endpoint you host.
          </p>

          <SequenceDiagram
            title="Business Cloud API: how a tool call routes"
            actors={mechanismActors}
            messages={businessApiMessages}
          />

          <p className="text-zinc-700 mt-6">
            Three honest consequences. First, you need a Meta developer account
            and a verified WhatsApp Business Account, which takes one to five
            business days. Second, you can only send freeform messages inside
            the 24-hour customer-service window after a user messages you;
            outside that window, every send must be a Meta-approved template.
            Third, every conversation is metered by country and category.
            Right tool if you are running B2B marketing to opted-in lists.
            Wrong tool if you want Claude to nudge your friend about lunch.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            What a whatsmeow / web-multidevice server looks like
          </h2>
          <p className="text-zinc-700 mb-6">
            The most popular GitHub result for &ldquo;WhatsApp MCP&rdquo; is{" "}
            <a
              href="https://github.com/lharries/whatsapp-mcp"
              className="text-teal-700 hover:text-teal-600 underline"
            >
              lharries/whatsapp-mcp
            </a>
            . It embeds a Go bridge built on the{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">whatsmeow</code>{" "}
            library, which speaks the reverse-engineered multidevice protocol
            the official WhatsApp Web client uses. The MCP scans a QR code at
            first launch and registers itself as one of your linked devices.
            It then keeps its own session alive, stores incoming messages in
            a local SQLite database, and the MCP tools mostly query that DB.
          </p>
          <p className="text-zinc-700 mb-6">
            Three honest consequences. First, no Meta developer account is
            involved, so you get freeform reach to anyone you can already
            message. Second, the MCP IS your auth: if the bridge process dies
            permanently or you wipe its session, the linked-device slot is
            gone and you re-pair. Third, Meta has historically suspended
            accounts that hammer the web-multidevice protocol in a way that
            looks like a bot, so high-volume use is a real risk vector.
            Right tool on Linux or Windows, or when you genuinely need to
            grep across years of personal message history. Wrong tool if you
            want to avoid holding any kind of WhatsApp-side auth in the MCP
            process.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            What a headless WhatsApp Web server looks like
          </h2>
          <p className="text-zinc-700 mb-6">
            A handful of community servers drive{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">web.whatsapp.com</code>{" "}
            inside a Playwright or Puppeteer Chromium. From WhatsApp&rsquo;s
            point of view this is identical to the whatsmeow path: another
            linked device, another web session. From your point of view it is
            strictly worse, because in addition to the linked-device footprint
            you also have a browser process to keep alive and a DOM full of{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">data-testid</code>{" "}
            selectors that change every time WhatsApp Web ships. Most of the
            entries on awesome-mcp-server style directories that claim a
            &ldquo;web-based&rdquo; WhatsApp MCP are this. If a selector
            breaks at 11pm, your MCP is silently broken until you redeploy.
          </p>
          <p className="text-zinc-700">
            Right tool for a hack-day demo. Wrong tool for anything that has
            to keep working without weekly attention.
          </p>
        </section>

        <section id="install" className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            What a macOS accessibility server looks like
          </h2>
          <p className="text-zinc-700 mb-6">
            The bottom row of the comparison table is the one this site is
            about. It does not replace Meta&rsquo;s API with another API. It
            replaces the API call with a process binding plus a UI-tree walk.
            The MCP looks up the running{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">net.whatsapp.WhatsApp</code>{" "}
            process by bundle id, gets its PID, calls{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">AXUIElementCreateApplication</code>,
            and walks the same accessibility tree VoiceOver does. There is no
            access token, no QR pair inside the MCP, no linked-device slot
            consumed. The auth is whatever the desktop app is signed in as.
          </p>

          <SequenceDiagram
            title="macOS accessibility: how the same tool call routes"
            actors={mechanismActors}
            messages={accessibilityMessages}
          />

          <p className="text-zinc-700 mt-6 mb-4">
            Worth comparing the two diagrams side by side. The Business API
            path has a network hop, an async webhook, and a token. The
            accessibility path has a pid, a tree walk, two CGEvents, and a
            second tree walk to verify. No network, no token, no webhook. The
            config env block reflects that:
          </p>

          <AnimatedCodeBlock
            code={mcpConfigCode}
            language="json"
            filename="~/.claude.json"
          />

          <p className="text-zinc-600 text-sm mt-6">
            That <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">env: {"{}"}</code>{" "}
            is not a placeholder. The MCP layer carries zero secrets. If you
            check this config into a backup you are not backing up a Meta
            token, because there is not one.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            The detail no other WhatsApp MCP server documents
          </h2>
          <p className="text-zinc-700 mb-4">
            Every MCP server I have read returns success for{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">send_message</code>{" "}
            as soon as the underlying call accepts the payload. The Business
            API path returns the moment{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">graph.facebook.com</code>{" "}
            returns 200 with a message ID. The whatsmeow path returns the
            moment the web-multidevice handshake acks. Neither one reads the
            conversation back to confirm the message bubble actually rendered.
            If WhatsApp silently drops or queues your message, the model is
            told the send succeeded.
          </p>
          <p className="text-zinc-700 mb-6">
            The macOS server does it differently. After it pastes the text and
            posts a Return CGEvent, it re-walks the accessibility tree of the
            WhatsApp window. WhatsApp Catalyst exposes every outgoing message
            as an <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">AXGenericElement</code>{" "}
            whose <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">description</code>{" "}
            is the literal string{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">&quot;Your message, &lt;text&gt;, 12:04 PM&quot;</code>.
            The server filters for that prefix, strips the timestamp with a
            regex, normalizes whitespace and case, and prefix-matches the text
            it just sent. Only if that match holds does the tool return{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">verified: true</code>.
            Otherwise it returns{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">verified: false</code>{" "}
            with a warning containing the last sent bubble it actually found.
          </p>

          <AnimatedCodeBlock
            code={verificationCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift, line 920-957"
          />

          <p className="text-zinc-700 mt-6">
            Why this matters. An LLM that called{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">whatsapp_send_message</code>{" "}
            and got back <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">verified: true</code>{" "}
            can move on; an LLM that got{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">verified: false</code>{" "}
            knows it has to retry, re-verify the active chat, or tell the
            user. That is a real signal, not a 200 OK from a queue. Worth
            grepping the source of whatever WhatsApp MCP server you are
            considering for &ldquo;verified&rdquo; before you trust its
            success-return at face value.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            The 11 tools the macOS server exposes
          </h2>
          <p className="text-zinc-700 mb-6">
            Defined in <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">setupAndStartServer</code>{" "}
            (main.swift line 990). Each tool below is a real{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">Tool(name:description:inputSchema:)</code>{" "}
            registration, not a marketing list:
          </p>

          <StepTimeline steps={toolList} />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            Installing the macOS server, end to end
          </h2>
          <p className="text-zinc-700 mb-6">
            Two commands and a config edit. No portal, no verification email,
            no phone code. The postinstall step compiles the Swift binary,
            that is the only build step.
          </p>

          <TerminalOutput
            title="install on a fresh Mac"
            lines={installLines}
          />

          <div className="mt-10">
            <StepTimeline title="What each step actually does" steps={setupSteps} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            How to choose between the four
          </h2>
          <p className="text-zinc-700 mb-4">
            A short decision rubric, in plain language, with no marketing
            varnish:
          </p>
          <ul className="space-y-3 text-zinc-700">
            <li>
              <strong>Pick Business Cloud API</strong> if your use case is
              opted-in broadcasts, verified-sender badge, or compliance with
              a published WhatsApp business policy. You are willing to wait
              for verification and pay per conversation.
            </li>
            <li>
              <strong>Pick whatsmeow / web-multidevice</strong> if you are on
              Linux or Windows, want freeform personal reach, and accept that
              the MCP itself holds your session and is your linked device. You
              accept the (small but real) risk of account suspension if usage
              looks botty.
            </li>
            <li>
              <strong>Pick headless WhatsApp Web</strong> only for a
              throwaway demo. It is the strictly-worse cousin of whatsmeow.
            </li>
            <li>
              <strong>Pick macOS accessibility</strong> if you are already on
              macOS with WhatsApp Desktop installed, want freeform personal
              reach without burning a linked-device slot, and want the MCP
              process to hold no credentials at all. Accept that this is the
              only path that needs you to keep the desktop app running and to
              grant Accessibility to the host once.
            </li>
          </ul>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          section="guide-footer"
          heading="Picking a WhatsApp MCP for something real?"
          description="Happy to look at the use case (B2B template flows, personal triage, scheduled sends) and tell you honestly which of the four paths fits. 20 minutes."
        />

        <FaqSection items={faqItems} />

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          section="guide-sticky"
          description="Book 20 minutes to walk through the right WhatsApp MCP for your use case."
        />
      </article>
    </>
  );
}
