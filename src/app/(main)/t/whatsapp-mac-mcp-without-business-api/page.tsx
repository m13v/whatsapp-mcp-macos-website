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
  CodeComparison,
  ComparisonTable,
  AnimatedChecklist,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@seo/components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/whatsapp-mac-mcp-without-business-api";
const PUBLISHED = "2026-05-05";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "WhatsApp MCP on Mac without the Business API: the OS path, not another API",
  description:
    "Every other WhatsApp MCP that skips Meta's Business API still routes through some API substitute, the whatsmeow web-multidevice protocol, GreenAPI, or a Playwright browser. whatsapp-mcp-macos is the only one that talks to the OS instead of to a protocol. It binds to net.whatsapp.WhatsApp, walks the macOS accessibility tree, and sets a 5.0 second AX timeout where the webhook used to be.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "WhatsApp Mac MCP without the Business API",
    description:
      "Bind to the running WhatsApp Desktop process, walk the macOS accessibility tree, no Meta developer account, no API key, no QR pairing for the MCP layer.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Mac MCP without the Business API",
    description:
      "Empty env block, bundle id net.whatsapp.WhatsApp, 5.0 second AX timeout. Eleven tools, zero Meta-side state.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "WhatsApp Mac MCP without Business API" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "WhatsApp Mac MCP without Business API", url: PAGE_URL },
];

const mcpConfigCode = `// ~/.claude.json (or your MCP client config)
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

const businessApiConfigCode = `// .env for the typical Business API path
WHATSAPP_PHONE_NUMBER_ID=...           // from Meta App Dashboard
WHATSAPP_BUSINESS_ACCOUNT_ID=...       // from WABA setup
WHATSAPP_ACCESS_TOKEN=EAA...           // long-lived system user token
WHATSAPP_APP_ID=...
WHATSAPP_APP_SECRET=...
WHATSAPP_VERIFY_TOKEN=...              // for webhook handshake
WEBHOOK_URL=                           // public HTTPS endpoint you host

// Plus, separately, in Meta's UI:
//  - business verification (1 to 5 days)
//  - phone number registration + 6-digit verify code
//  - message template approval, per locale (24 to 48 hours)
//  - 24-hour customer service window per recipient
//  - per-conversation pricing by country and category`;

const installLines = [
  { type: "command" as const, text: "npm install -g whatsapp-mcp-macos" },
  {
    type: "info" as const,
    text:
      "postinstall: xcrun swift build -c release",
  },
  {
    type: "output" as const,
    text:
      "Build complete! .build/release/whatsapp-mcp",
  },
  { type: "command" as const, text: "# add to ~/.claude.json (mcpServers.whatsapp, env: {})" },
  { type: "command" as const, text: "# restart Claude Code, run /mcp to reconnect" },
  {
    type: "success" as const,
    text:
      "log: setupAndStartServer: defined 11 tools",
  },
];

const bindingCode = `// Sources/WhatsAppMCP/main.swift, line 57
let whatsAppBundleID = "net.whatsapp.WhatsApp"

// line 59 to 62
func getWhatsAppPid() -> pid_t? {
    let apps = NSRunningApplication
        .runningApplications(withBundleIdentifier: whatsAppBundleID)
    return apps.first?.processIdentifier
}

// line 118 to 122 (top of traverseAXTree)
func traverseAXTree(pid: pid_t, maxDepth: Int = 15) -> [AXElementInfo] {
    let appElement = AXUIElementCreateApplication(pid)
    AXUIElementSetMessagingTimeout(appElement, 5.0)
    var results: [AXElementInfo] = []
    // ... walks the AX tree by role, description, value, title, position
}`;

const accessibilityCheckCode = `// Sources/WhatsAppMCP/main.swift, line 562 to 572
func requireAccessibility() -> String? {
    let trusted = AXIsProcessTrustedWithOptions(
        [kAXTrustedCheckOptionPrompt.takeRetainedValue(): false]
            as CFDictionary
    )
    if trusted { return nil }
    return serializeToJsonString([
        "error": "Accessibility permission not granted. The user must enable it in System Settings > Privacy & Security > Accessibility for the app running this MCP server. Without this permission, WhatsApp cannot be controlled.",
        "fix": "Open System Settings > Privacy & Security > Accessibility and toggle ON the app that hosts whatsapp-mcp.",
        "accessibilityTrusted": "false"
    ]) ?? "{\\"error\\": \\"Accessibility permission not granted.\\"}"
}`;

const checklistItems = [
  {
    text:
      "Meta developer account: not required. The MCP never talks to graph.facebook.com.",
    checked: false,
  },
  {
    text:
      "Business verification: not required. There is no business profile on the other end.",
    checked: false,
  },
  {
    text:
      "Phone number provisioning: not required. The phone number is whatever your WhatsApp Desktop app is signed in as.",
    checked: false,
  },
  {
    text:
      "Message template approval: not required. There are no templates, the send tool pastes literal text into the compose textarea.",
    checked: false,
  },
  {
    text:
      "Public HTTPS webhook: not required. The transport is stdio, the MCP child reads JSON-RPC from stdin and writes to stdout.",
    checked: false,
  },
  {
    text:
      "24-hour customer service window: not enforced. You can message anyone you can already message in WhatsApp Desktop.",
    checked: false,
  },
  {
    text:
      "Per-conversation pricing: zero. AXUIElementCopyAttributeValue does not bill per call.",
    checked: false,
  },
  {
    text:
      "Accessibility permission for the host: required. Granted to the process that forks the MCP child (Claude Code, Cursor, Terminal, Fazm).",
    checked: true,
  },
  {
    text:
      "WhatsApp Desktop installed and signed in: required. One-time QR pair with your phone, that login is the auth.",
    checked: true,
  },
];

const pathRows = [
  {
    feature: "Auth model",
    competitor:
      "Meta-issued access token tied to a verified Business Account. Token rotation, system users, app secrets.",
    ours:
      "Whatever WhatsApp Desktop is already signed in as. The MCP layer has no credentials. The env block is literally {}.",
  },
  {
    feature: "Transport",
    competitor:
      "HTTPS to graph.facebook.com plus a public HTTPS webhook the caller has to host for inbound messages and delivery state.",
    ours:
      "stdio. The MCP host forks the binary and pipes JSON-RPC over stdin and stdout. No ports, no TLS, no inbound URL.",
  },
  {
    feature: "What the call actually does",
    competitor:
      "POST a JSON payload referencing a pre-approved template ID. Meta routes it.",
    ours:
      "Walks AXUIElement nodes inside the running net.whatsapp.WhatsApp process, finds the AXTextArea, posts a Cmd+V CGEvent, presses Return. The OS does the routing.",
  },
  {
    feature: "Sender identity",
    competitor:
      "A registered business phone number with a verified profile.",
    ours:
      "The human's own personal account. The same one that shows up in their friends' chats.",
  },
  {
    feature: "Approval surface",
    competitor:
      "Business verification, phone registration, template review, app review for advanced permissions.",
    ours:
      "One macOS Accessibility checkbox in System Settings.",
  },
  {
    feature: "Per-message cost",
    competitor:
      "Per-conversation pricing set by Meta, varying by country and category.",
    ours:
      "Zero. The accessibility framework is part of the OS.",
  },
  {
    feature: "What 'opt in' means",
    competitor:
      "End user must have given the business explicit opt-in for marketing categories.",
    ours:
      "There is no business in the loop. The user is messaging from their own logged-in account, the same way they would in the app.",
  },
];

const apiSubstituteRows = [
  {
    feature: "What replaces Meta's API",
    competitor:
      "Some other API. whatsmeow speaks the WhatsApp Web multidevice protocol. GreenAPI is a paid third-party WhatsApp gateway. Playwright drives WhatsApp Web in a real browser.",
    ours:
      "Nothing replaces an API, because no API is in the path. The server reads the AX tree of the WhatsApp Desktop app the same way VoiceOver does.",
  },
  {
    feature: "Pairing step",
    competitor:
      "QR scan inside the MCP server itself, or a logged-in browser session that has to be kept warm. Both can drop unpredictably.",
    ours:
      "QR pair was done once, in WhatsApp Desktop, the day the user installed it. The MCP layer never sees a QR code.",
  },
  {
    feature: "Where the session lives",
    competitor:
      "A SQLite file or a Chromium user-data dir owned by the MCP project. Lose it and you re-pair.",
    ours:
      "Inside Apple's Keychain and WhatsApp Desktop's own Group Container. Lose your laptop and you re-pair WhatsApp itself, not the MCP.",
  },
  {
    feature: "Failure mode",
    competitor:
      "Protocol-level disconnects, rate limits, captcha, multi-device session expiry. Often silent.",
    ours:
      "If the AX tree does not respond inside 5.0 seconds, the call errors cleanly and the model can decide what to do next.",
  },
  {
    feature: "What 'this works on Mac' means",
    competitor:
      "Same code runs anywhere the protocol or browser runs. Mac is incidental.",
    ours:
      "Mac is the entire point. The Catalyst app exposes a stable AX tree under macOS 13+. No Linux or Windows port is possible because there is no Catalyst app to drive there.",
  },
];

const faqItems = [
  {
    q: "Can I really run a WhatsApp MCP on Mac without the Business API?",
    a: "Yes. whatsapp-mcp-macos installs from npm, registers a stdio child process in your MCP host config, and drives the official WhatsApp Desktop app on your Mac through the macOS accessibility framework. There is no Meta developer account, no app review, no phone number provisioning, no access token, no webhook, and no template approval. The bundle id net.whatsapp.WhatsApp is hardcoded at line 57 of Sources/WhatsAppMCP/main.swift, and every accessibility call routes through that PID with a 5.0 second AXUIElementSetMessagingTimeout (line 120). The env block in your MCP config is literally an empty object.",
  },
  {
    q: "How is this different from other WhatsApp MCP servers that also avoid the Business API?",
    a: "Every other 'no Business API' WhatsApp MCP I have looked at still routes through some API substitute. lharries/whatsapp-mcp embeds a Go bridge that speaks the WhatsApp Web multidevice protocol via the whatsmeow library, so you scan a QR inside the MCP itself and it maintains its own session. msaelices/whatsapp-mcp-server connects to GreenAPI, a paid third-party WhatsApp gateway. A handful of others drive WhatsApp Web in a Playwright Chromium. whatsapp-mcp-macos does not replace Meta's API with another API. It binds to the running net.whatsapp.WhatsApp Catalyst process and walks the AXUIElement tree, the same accessibility surface VoiceOver and other assistive tech use.",
  },
  {
    q: "Do I need to scan a QR code to set up the MCP?",
    a: "No. The MCP layer never sees a QR code. The QR pair was already done, once, when you installed WhatsApp Desktop from the Mac App Store and signed in with your phone. That pairing lives inside WhatsApp Desktop's own session storage, not inside the MCP. The MCP just drives whatever account the desktop app is currently signed in as. If you sign out of WhatsApp Desktop, the MCP loses its target. If you sign in to a different account, the MCP starts driving that one. Pairing is the operating system's problem, not the MCP's.",
  },
  {
    q: "What permissions does the MCP actually need?",
    a: "Exactly one: macOS Accessibility, granted to the host process that forks the MCP child. If you launch Claude Code from /Applications/Claude.app, you grant Accessibility to Claude. If you run an MCP test from Terminal, you grant it to Terminal. The check is at line 562 of main.swift, and on a denied call it returns a JSON error pointing at System Settings > Privacy & Security > Accessibility. There is also a functional probe at line 576 that actually tries to read the AX tree, because AXIsProcessTrustedWithOptions can return true while the TCC database is stale and AX calls silently fail.",
  },
  {
    q: "What does the install actually do?",
    a: "npm install -g whatsapp-mcp-macos pulls the package and runs xcrun swift build -c release as a postinstall script (declared in package.json). That builds a Swift binary at .build/release/whatsapp-mcp. The npm bin script wires whatsapp-mcp on your PATH to that binary. From there you add an mcpServers.whatsapp entry to ~/.claude.json (or your client's equivalent) with type stdio, command whatsapp-mcp, args [], env {}. Restart your MCP host or run /mcp to reconnect. The first call surfaces the Accessibility prompt if it is not granted.",
  },
  {
    q: "What can the model actually do once it is connected?",
    a: "Eleven tools, assembled into the allTools array at line 1110 of main.swift: whatsapp_status, whatsapp_start, whatsapp_quit, whatsapp_get_active_chat, whatsapp_list_chats, whatsapp_search, whatsapp_open_chat, whatsapp_scroll_search, whatsapp_read_messages, whatsapp_send_message, and whatsapp_navigate. The recommended workflow is search, open_chat, get_active_chat (verify), then send_message. The send tool pastes the text via the clipboard, posts a Return CGEvent, then re-reads the AX tree to confirm the bubble appeared. There is no whatsapp_create_chat. If a recipient is not already in your sidebar, the agent has nothing to click, which is intentional.",
  },
  {
    q: "Why is this Mac only? Can it ever run on Windows or Linux?",
    a: "No, and this is by design. The path depends on three Apple-specific pieces. First, AXUIElement, which is Apple's accessibility framework, used by VoiceOver. Second, the WhatsApp Catalyst app, which is the macOS port of the iPad WhatsApp build, with a stable accessibility tree under macOS 13 and later. Third, CGEvent for posting clicks and key events. Windows has UI Automation, which is a different shape. Linux has AT-SPI, but WhatsApp does not ship a Linux desktop app at all. A Linux or Windows version would need a different transport entirely, probably whatsmeow, which is the path the Mac version was specifically designed to avoid.",
  },
  {
    q: "What are the honest limitations of going via accessibility instead of an API?",
    a: "The server can only see what is rendered. If a chat has not been opened, its messages are not in the AX tree, so whatsapp_read_messages cannot fetch arbitrary history. Text only. The send tool pastes text into the compose textarea; it does not handle images, files, voice, or video. Single window assumption. The accessibility tree parsing assumes the standard WhatsApp window layout, with x-coordinate thresholds for sidebar versus chat panel. Visible cursor and clipboard side effects are minimised but real, the cursor moves and the clipboard is briefly overwritten before being restored. And it is genuinely macOS only. If any of those constraints are deal breakers, the Business API or whatsmeow paths are the right choice instead.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "WhatsApp MCP on Mac without the Business API: the OS path, not another API",
    description:
      "Why whatsapp-mcp-macos is the only WhatsApp MCP that does not replace Meta's API with another API. It binds to the net.whatsapp.WhatsApp Catalyst process, walks the macOS accessibility tree, and sets a 5.0 second AX timeout where the Business API webhook used to be.",
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

export default function WhatsappMacMcpWithoutBusinessApiPage() {
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
              guide / mac native path
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.1]">
              <GradientText>WhatsApp MCP on Mac, without the Business API.</GradientText>{" "}
              And without any other API either.
            </h1>
            <p className="text-base md:text-lg text-zinc-700 mb-5 max-w-2xl">
              Short answer: yes, you can. Install the npm package, grant
              Accessibility permission to your MCP host, and the server drives
              the WhatsApp Desktop app you are already signed in to. No Meta
              developer account, no API key, no webhook, no QR pairing for the
              MCP layer. The empty <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">env: {"{}"}</code> in the
              config below is not a typo.
            </p>
            <p className="text-sm md:text-base text-zinc-600 mb-8 max-w-2xl">
              The longer answer is more interesting. Every other &ldquo;no
              Business API&rdquo; WhatsApp MCP I have read still replaces
              Meta&rsquo;s API with a different API. This one does not. It uses
              the operating system instead.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#install">
                Install in two minutes
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
            readingTime="8 min read"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 mt-12">
          <GlowCard>
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-teal-700 mb-3">
                Direct answer, verified 2026-05-05
              </p>
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mb-4">
                Yes, the Mac path skips the Business API entirely.
              </h2>
              <p className="text-zinc-700 leading-relaxed mb-3">
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">whatsapp-mcp-macos</code> is a Swift
                MCP server that binds to the running WhatsApp Desktop process by
                bundle id <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">net.whatsapp.WhatsApp</code>{" "}
                and drives it through the same accessibility framework
                VoiceOver uses. There is no Meta developer account in the loop,
                no access token, no template, no webhook, and no per-message
                fee. The MCP layer carries zero secrets. Your auth is whatever
                WhatsApp Desktop is signed in as.
              </p>
              <p className="text-zinc-600 text-sm">
                Authoritative source for everything below:{" "}
                <a
                  href="https://github.com/m13v/whatsapp-mcp-macos"
                  className="text-teal-700 hover:text-teal-600 underline"
                >
                  github.com/m13v/whatsapp-mcp-macos
                </a>
                . Specific files cited: <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">Sources/WhatsAppMCP/main.swift</code>{" "}
                and <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">package.json</code>.
              </p>
            </div>
          </GlowCard>
        </section>

        <section id="install" className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            What &ldquo;install&rdquo; looks like in practice
          </h2>
          <p className="text-zinc-700 mb-6">
            Two commands and a config edit. No portal. No verification email.
            No phone code. No template review. No HTTPS endpoint to host. The
            postinstall step compiles the Swift binary; that is the only build
            step.
          </p>
          <TerminalOutput
            title="install on a fresh Mac"
            lines={installLines}
          />
          <p className="text-zinc-600 text-sm mt-6">
            The configured env block stays empty for the lifetime of the
            project. There is nothing to rotate, nothing to revoke, nothing to
            leak. If you check{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">
              ~/.claude.json
            </code>{" "}
            into a backup the way you check most config files, you are not
            backing up a Meta token, because there is not one.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            The two configs, side by side
          </h2>
          <p className="text-zinc-700 mb-2">
            The Business API setup is not just code. The bulk of it lives
            inside Meta&rsquo;s portal: business verification, phone
            registration, template approval per locale, the 24-hour customer
            service window, and the per-conversation price sheet. The MCP path
            is what shows up in <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">~/.claude.json</code>{" "}
            and that is the whole config.
          </p>
          <CodeComparison
            title="WhatsApp client config"
            leftLabel="Business API .env"
            rightLabel="MCP stdio config"
            leftLines={18}
            rightLines={9}
            leftCode={businessApiConfigCode}
            rightCode={mcpConfigCode}
            reductionSuffix="fewer config surfaces"
          />
          <p className="text-zinc-600 text-sm mt-4">
            The right pane is the entire client-side configuration. Everything
            else is the operating system handing your MCP host a process to
            attach to.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            Where the API used to be: a 5.0 second AX timeout
          </h2>
          <p className="text-zinc-700 mb-3">
            On the Business API path, every send is an HTTPS POST to{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">graph.facebook.com</code>{" "}
            and every inbound message is a webhook to a public URL you host.
            Both fail in network-shaped ways: TLS, DNS, retries, signed
            payloads, signature mismatches.
          </p>
          <p className="text-zinc-700 mb-6">
            On the Mac path, all of that is replaced by two lines of Swift. The
            server binds to the running app by bundle id, then sets a 5.0
            second messaging timeout on the AX element. Every accessibility
            call after that, walks, clicks, attribute reads, errors out cleanly
            if the WhatsApp window does not respond within the ceiling. There
            is no retry queue and no exponential backoff because there is no
            network.
          </p>
          <AnimatedCodeBlock
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
            code={bindingCode}
          />
          <p className="text-zinc-600 text-sm mt-4">
            That is the entire transport layer. <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">AXUIElementCreateApplication(pid)</code>{" "}
            returns a handle to the live WhatsApp process, and{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">AXUIElementSetMessagingTimeout(appElement, 5.0)</code>{" "}
            decides how patient every later call is.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            What you do not need, line by line
          </h2>
          <p className="text-zinc-700 mb-2">
            For each of the things the Business API requires of you, I will
            tell you whether it shows up on the Mac path. Most of them do not.
          </p>
          <AnimatedChecklist
            title="Business API requirement vs Mac MCP path"
            items={checklistItems}
          />
          <p className="text-zinc-600 text-sm mt-2">
            The single accessibility checkbox is doing a lot of work. It
            replaces the entire Meta-side approval surface, and it lives in
            System Settings.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            How the auth check is enforced
          </h2>
          <p className="text-zinc-700 mb-3">
            The MCP&rsquo;s only authority check happens once per tool call,
            before any AX call is made. If the host process is not in the
            macOS Accessibility allowlist, the call returns a structured JSON
            error pointing at the right System Settings pane, instead of
            silently doing nothing.
          </p>
          <AnimatedCodeBlock
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
            code={accessibilityCheckCode}
          />
          <p className="text-zinc-600 text-sm mt-4">
            There is also a functional probe a few lines later that actually
            tries to read the AX tree, because{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">
              AXIsProcessTrustedWithOptions
            </code>{" "}
            can return true while the TCC database is stale and AX calls
            silently fail. That distinction shows up in{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">whatsapp_status</code>{" "}
            as <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">accessibilityWorking</code>.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <ComparisonTable
            heading="Business API vs the Mac MCP path"
            intro="The shapes of the two contracts are opposite."
            productName="whatsapp-mcp-macos"
            competitorName="WhatsApp Business API"
            rows={pathRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            But what about the other &ldquo;no Business API&rdquo; MCPs?
          </h2>
          <p className="text-zinc-700 mb-3">
            Fair question. There are a few. The most popular ones I know about
            are <a href="https://github.com/lharries/whatsapp-mcp" className="text-teal-700 hover:text-teal-600 underline">lharries/whatsapp-mcp</a>{" "}
            (Go bridge speaking the WhatsApp Web multidevice protocol via{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">whatsmeow</code>),{" "}
            <a href="https://github.com/msaelices/whatsapp-mcp-server" className="text-teal-700 hover:text-teal-600 underline">msaelices/whatsapp-mcp-server</a>{" "}
            (which connects to GreenAPI, a paid third-party WhatsApp gateway),
            and a handful of Playwright-driven WhatsApp Web automations.
          </p>
          <p className="text-zinc-700 mb-6">
            All of them avoid the Business API. None of them avoid having an
            API in the path. The Mac one does.
          </p>
          <ComparisonTable
            productName="whatsapp-mcp-macos"
            competitorName="other &lsquo;no Business API&rsquo; MCPs"
            rows={apiSubstituteRows}
          />
          <p className="text-zinc-600 text-sm mt-4">
            None of those projects are wrong. They are the right answer for
            different problems. If you want a single MCP that runs on Linux,
            Windows, and Mac and does not depend on a desktop app being
            installed, whatsmeow is the path. If you want a hosted gateway
            with a SaaS billing model, GreenAPI does that. If you want an MCP
            that does not require any of those things and treats your
            existing Mac WhatsApp install as the substrate, this is that one.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            Why this is Mac only and probably will be
          </h2>
          <p className="text-zinc-700 mb-3">
            Three macOS-specific pieces hold the design together.
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono"> AXUIElement</code>{" "}
            is Apple&rsquo;s accessibility framework, the same surface
            VoiceOver and Switch Control use. The WhatsApp Catalyst app exposes
            a stable AX tree under macOS 13 and later because Catalyst inherits
            UIKit&rsquo;s accessibility surface for free. And{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">
              CGEvent
            </code>{" "}
            posts low-level mouse and keyboard events into the same input
            stream a human would use.
          </p>
          <p className="text-zinc-700">
            Windows has UI Automation, which is a different shape and would
            need a fresh implementation. Linux has AT-SPI, but WhatsApp does
            not ship a Linux desktop client at all, so there is no app to
            drive there. A &ldquo;cross-platform port&rdquo; would have to use
            the WhatsApp Web protocol or a browser, and at that point you are
            running one of the other MCPs above. The Mac path is not a
            stepping stone. It is the destination.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <BookCallCTA
            appearance="footer"
            destination={CAL_LINK}
            site="WhatsApp MCP"
            heading="Want a hand wiring this into your agent?"
            description="If you are building an AI agent that needs WhatsApp on a Mac and you would rather not climb the Business API tree, book a 30-minute call. Bring your stack, leave with a working stdio config and a clear sense of where this path stops fitting."
          />
        </section>

        <FaqSection
          heading="Common questions"
          items={faqItems}
        />

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Book a 30-min call to wire WhatsApp MCP into your agent."
        />
      </article>
    </>
  );
}
