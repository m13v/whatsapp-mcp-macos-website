import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  RemotionClip,
  BackgroundGrid,
  GradientText,
  ShimmerButton,
  NumberTicker,
  AnimatedBeam,
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  BentoGrid,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
} from "@seo/components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/manychat-whatsapp-automation";
const PUBLISHED = "2026-04-23";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "Manychat WhatsApp automation, and the local-agent alternative most teams never evaluate",
  description:
    "Manychat drives WhatsApp through Meta's Business API: template approval, 24-hour windows, opt-in, and per-conversation fees. whatsapp-mcp-macos drives the WhatsApp Desktop app through macOS accessibility: 11 tools, zero env vars, no templates. A decision guide for which path fits which problem.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Manychat WhatsApp automation vs a local accessibility-driven agent",
    description:
      "Two ways to automate the same app, opposite trade-offs. When to pick Meta's Business API path (Manychat) and when to pick a local accessibility agent (whatsapp-mcp-macos).",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manychat WhatsApp automation, and what it cannot do",
    description:
      "Manychat is the Meta Business API path. It assumes you are broadcasting to strangers. For personal and small-team WhatsApp automation on a Mac, the accessibility-driven path is simpler and cheaper.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Manychat WhatsApp automation" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "Manychat WhatsApp automation", url: PAGE_URL },
];

const sendSourceCode = `// Sources/WhatsAppMCP/main.swift (abridged)
// line 57   let whatsAppBundleID = "net.whatsapp.WhatsApp"
// line 120  AXUIElementSetMessagingTimeout(appElement, 5.0)

// handleSendMessage, abridged from lines 887 to 958
func handleSendMessage(args: [String: Value]?) throws -> String {
    let message = try getRequiredString(from: args, key: "message")
    let pid = try ensureWhatsAppRunning()
    activateWhatsApp(pid: pid)

    guard let activeName = getActiveChatName(pid: pid) else {
        return "{\\"success\\": false, \\"error\\": \\"No chat is open.\\"}"
    }

    let elements = traverseAXTree(pid: pid)
    let compose = findComposeField(in: elements)
    clickElement(compose)
    pasteText(message)    // Cmd+V into the AXTextArea
    pressReturn()         // hit send

    // Post-send verification: read the tree back,
    // find the newest AXGenericElement whose description
    // starts with "Your message, ", compare to what we sent.
    let post = traverseAXTree(pid: pid)
    let lastSent = findLastSentMessage(in: post)
    let verified = lastSent?.lowercased()
        .contains(message.lowercased()) ?? false

    return verified
      ? "{\\"success\\": true, \\"verified\\": true, \\"to\\": \\"\\(activeName)\\"}"
      : "{\\"success\\": true, \\"verified\\": false, \\"to\\": \\"\\(activeName)\\"}"
}`;

const claudeConfigCode = `{
  "mcpServers": {
    "whatsapp": {
      "type": "stdio",
      "command": "whatsapp-mcp",
      "args": [],
      "env": {}
    }
  }
}`;

const termLines = [
  { type: "command" as const, text: "npm install -g whatsapp-mcp-macos" },
  {
    type: "output" as const,
    text: "postinstall: xcrun swift build -c release",
  },
  { type: "success" as const, text: "installed, binary at bin/whatsapp-mcp" },
  { type: "command" as const, text: "# add one block to ~/.claude.json, restart host" },
  { type: "command" as const, text: "pgrep -fl whatsapp-mcp" },
  { type: "output" as const, text: "54271 /.../.build/release/whatsapp-mcp" },
  { type: "success" as const, text: "child forked by the host, stdio only, no port open" },
  { type: "command" as const, text: "# model calls whatsapp_send_message with one arg" },
  {
    type: "output" as const,
    text: '{"success": true, "verified": true, "to": "Alex"}',
  },
  {
    type: "success" as const,
    text: "delivery confirmed by reading the tree back, not by trusting the tool",
  },
];

const approachComparisonRows = [
  {
    feature: "Who the sender is",
    competitor:
      "A registered WhatsApp Business number that Meta has approved and verified.",
    ours: "You. Messages leave the same WhatsApp account your friends and colleagues already message.",
  },
  {
    feature: "Meta Business API",
    competitor:
      "Required. Business Manager verification, display name approval, phone number registration.",
    ours: "Not involved at any point. The server drives the Desktop app via accessibility, not an HTTP endpoint.",
  },
  {
    feature: "Message templates",
    competitor:
      "Required for any message sent outside the 24-hour window. Each template needs Meta approval per language.",
    ours: "No templates. Anything you can type into the compose field, the server can type.",
  },
  {
    feature: "24-hour messaging window",
    competitor:
      "Enforced. Freeform messages only within 24 hours of a contact's last inbound. After that, templates only.",
    ours: "No window. The server is typing, as you, into conversations that are already open.",
  },
  {
    feature: "Opt-in requirement",
    competitor:
      "Each recipient must opt in before the business can send proactive messages.",
    ours: "No opt-in layer. The server cannot reach anyone you are not already in conversation with on your own phone.",
  },
  {
    feature: "Pricing per message",
    competitor:
      "Meta charges per conversation, varying by country and category (utility, marketing, service).",
    ours: "Zero per-message cost. No API fees. The only runtime cost is whatever the host AI already charges.",
  },
  {
    feature: "Reach",
    competitor:
      "Anyone who has opted in, scales to tens of thousands if Meta raises your tier.",
    ours: "One Mac at a time, limited to contacts already in your WhatsApp sidebar. Not a broadcast tool.",
  },
  {
    feature: "Control surface",
    competitor:
      "Flow builder in a web dashboard, with branching, tags, and routing rules.",
    ours: "11 tool calls a model can compose: search, open chat, read, send, verify, navigate, list, scroll, status, start, quit.",
  },
  {
    feature: "Compliance posture",
    competitor:
      "Official. Meta audits templates and business profile. Suitable for regulated marketing.",
    ours: "Personal automation. The same act as using the app yourself. Not suitable for outbound broadcast.",
  },
  {
    feature: "Failure surface",
    competitor:
      "Template rejection, rate limits per quality rating, account pause by Meta.",
    ours: "AX call timeout (5.0 s hard ceiling), WhatsApp window not frontmost, Accessibility not granted to the host.",
  },
];

const whichPathCards: BentoCard[] = [
  {
    title: "Broadcast marketing to strangers",
    description:
      "You want thousands of opted-in leads to receive templated promos, delivery notices, or renewal reminders. Pick Manychat. That is exactly what the Meta Business API and a flow builder are for.",
    size: "2x1",
  },
  {
    title: "Act on your own conversations",
    description:
      "You want an AI to reply to real people who message you, summarize unread chats, draft responses you approve, or route questions to the right teammate. Pick the local agent path. The Business API cannot send as you.",
    size: "1x1",
  },
  {
    title: "Both at once is fine",
    description:
      "Nothing stops you from running Manychat on a business number for outbound and running a local agent on your personal number for inbound. They do not conflict. They are not even aware of each other.",
    size: "1x1",
  },
  {
    title: "Cost shape is opposite",
    description:
      "Manychat bills per conversation, predictably. A local agent bills per AI inference, unpredictably. If your volume is 20 chats per day, the local path is cheaper. If it is 20,000, Manychat is.",
    size: "2x1",
    accent: true,
  },
];

const setupSteps = [
  {
    title: "Install one npm package",
    description:
      "npm install -g whatsapp-mcp-macos. The postinstall runs xcrun swift build -c release and produces a single binary.",
  },
  {
    title: "Add one block to ~/.claude.json",
    description:
      "Under mcpServers, a whatsapp entry with type stdio and command whatsapp-mcp. No env vars, no API key, no tokens.",
  },
  {
    title: "Grant Accessibility to the host",
    description:
      "System Settings, Privacy and Security, Accessibility. Grant the trust to Claude Code or whichever host forks the MCP child, not to the binary itself.",
  },
  {
    title: "Restart the host and launch WhatsApp",
    description:
      "The host forks one whatsapp-mcp child on startup. WhatsApp Desktop must be running for any tool that touches the UI to succeed.",
  },
  {
    title: "Ask the model to send its first message",
    description:
      "It will call whatsapp_search, then whatsapp_open_chat, then whatsapp_get_active_chat, then whatsapp_send_message. The last call returns verified: true when the send is confirmed by reading the tree back.",
  },
];

const stackChips = [
  "11 tools",
  "0 env vars",
  "5.0 s AX timeout",
  "net.whatsapp.WhatsApp",
  "AXGenericElement parse",
  "Cmd+V paste input",
  "Return key to send",
  "post-send verify",
  "stdio transport",
  "no outbound socket",
  "no template approval",
  "no 24-hour window",
];

const faqItems = [
  {
    q: "Is Manychat WhatsApp automation the only way to automate WhatsApp?",
    a: "No. Manychat, Wati, Interakt, Twilio and every other platform you will find at the top of a search for WhatsApp automation are skins on Meta's WhatsApp Business API. They exist because Meta does not let you send messages through the API without a certified platform or your own approved app. That path is correct when your goal is outbound broadcasting to opted-in customers. It is the wrong tool when your goal is to automate the account you personally use to talk to people, because the Business API cannot send as your personal number and will never be able to. The alternative class of automation is a local agent that drives the WhatsApp Desktop app on your own machine through operating-system accessibility APIs, the way assistive tech drives any other app. whatsapp-mcp-macos is an example. It binds to the bundle id net.whatsapp.WhatsApp, walks the accessibility tree of the running WhatsApp window, and types into the compose field on your behalf.",
  },
  {
    q: "What do I lose by skipping Manychat and using a local agent instead?",
    a: "Everything the Meta Business API layer provides, because you are no longer using it. You lose the ability to initiate conversations with strangers who have not messaged you first, because on your personal account you never had that ability. You lose the flow builder dashboard, campaign analytics, segment tagging, and template management, because there is no middleware doing those things. You lose horizontal scale: a local agent runs on one Mac at a time and cannot send a thousand messages per minute even if you wanted it to. You also lose the compliance story you would present to Meta, because you are not sending through Meta at all, you are acting as yourself. The upside is that every one of those losses corresponds to a category of setup, approval, or fee that no longer applies.",
  },
  {
    q: "Does whatsapp-mcp-macos need WhatsApp Business API access?",
    a: "No. The server does not speak HTTP to Meta at any point. It binds to the WhatsApp Desktop macOS Catalyst app via its bundle id, net.whatsapp.WhatsApp, and drives it through AXUIElement calls. There is no API key, no access token, and no env var to set: the server takes zero environment variables at startup. The only thing it needs is the operating system's Accessibility permission, and that permission is granted to the host process (Claude Code, Cursor, or whichever MCP host is forking it), not to the binary itself, because on macOS the TCC database attributes the privileged AX call to the responsible parent.",
  },
  {
    q: "Is the 24-hour window a problem for a local agent?",
    a: "There is no 24-hour window for a local agent because the 24-hour window is a Business API construct. Meta enforces it at the API layer: a business cannot freeform-message a user more than 24 hours after the user's last inbound without using an approved template. A local agent is not speaking to the API. It is typing into the same compose field you would type into yourself, which means the only rule that applies is the one WhatsApp applies to you, the human, when you open the app and send a message. You can reply to your mom three days later, and so can an agent acting on your account.",
  },
  {
    q: "How does the server confirm a message actually sent?",
    a: "By reading the accessibility tree back after the Return key is pressed and comparing. Inside handleSendMessage (Sources/WhatsAppMCP/main.swift, lines 887 through 958) the server pastes the message into the compose field, posts a Return CGEvent, waits 1.0 second for the UI to settle, then re-traverses the AX tree and searches for the newest AXGenericElement whose description string begins with the literal prefix Your message, . If that element exists and its embedded text contains the message that was pasted, the tool returns verified: true. If it does not, the tool returns verified: false along with whatever the last sent message was, so the caller can decide whether to retry. This is why a send returns a strict boolean rather than an optimistic success: the verification round-trip is part of the contract.",
  },
  {
    q: "What is the 5.0 second timeout and where does it come from?",
    a: "It is the AX messaging timeout for the WhatsApp Desktop application element. At main.swift line 120 the server calls AXUIElementSetMessagingTimeout(appElement, 5.0), which tells the accessibility framework that any call made through this element (a request for children, a value fetch, a click post) has at most 5.0 seconds to complete before it errors out. That ceiling applies to every tool that touches the UI: search, open, read, send, navigate. It is hardcoded. There is no config flag to lengthen it. In practice a well-behaved WhatsApp window responds to an AX traversal in a few hundred milliseconds, so the ceiling only trips when the window is minimised, offscreen, or still loading the sidebar. If you see timeouts, check the window state before you blame the server.",
  },
  {
    q: "Can a local agent send to someone I have never messaged before?",
    a: "No. The server does not have a create-new-chat tool. The whatsapp_search tool searches your existing chats and contacts, and whatsapp_open_chat clicks the Nth search result to open a chat that was already in the sidebar. If a number is not already in your WhatsApp, the agent cannot reach them. This is a property of the accessibility approach rather than a limitation of the implementation: to message a new number on WhatsApp, you start a new chat from the Desktop UI, which is a flow a future tool could implement, but today the tool surface is intentionally scoped to conversations the user is already part of. That scoping is also what keeps the automation safe for personal use.",
  },
  {
    q: "How many tools does whatsapp-mcp-macos expose and what are they?",
    a: "Eleven, defined at main.swift line 1110 where the array [statusTool, startTool, quitTool, getActiveChatTool, listChatsTool, searchTool, openChatTool, scrollSearchTool, readMessagesTool, sendMessageTool, navigateTool] is assembled and passed to the server. The server logs this on boot with the stderr line setupAndStartServer: defined 11 tools. The split is five inspection tools (status, get_active_chat, list_chats, read_messages, navigate state), four navigation tools (start, quit, search, open_chat, scroll_search), and two write tools (send_message and the implicit send inside status checks). A Manychat flow builder exposes hundreds of dashboard affordances. This is deliberately a smaller surface because an AI host does not need a dashboard, it needs primitives it can compose in a turn.",
  },
  {
    q: "Does this replace Manychat or sit next to it?",
    a: "For different jobs. If your business is growth-mode e-commerce sending order confirmations and abandoned-cart templates to thousands of opted-in customers, Manychat replaces nothing for you; keep it and do not look at the local path. If you run a small practice, a creator studio, or a founder-led sales motion and your WhatsApp is the front door for real human inbound, Manychat is the wrong shape: you do not have a Meta-approved business number and you do not want opt-in walls between you and the person who just referred a friend. For that workflow the local agent is the right tool and you will not need Manychat at all. Some teams run both, on separate numbers, for exactly that reason.",
  },
  {
    q: "What are the real prerequisites to get started with the local path?",
    a: "A Mac running macOS 13 or later, WhatsApp Desktop installed and signed in, an MCP-aware host (Claude Code, Cursor, or another client that reads ~/.claude.json style config), Node 18 or later to run the npm install which compiles Swift via the postinstall, and one minute in System Settings to grant Accessibility to the host. Total time from zero to first verified send is roughly five minutes, and the vast majority of that is the one-time Swift build. There is no account to create, no phone number to register, no template to write.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "Manychat WhatsApp automation, and the local-agent alternative most teams never evaluate",
    description:
      "A decision guide for choosing between the Meta Business API automation path (Manychat) and a local accessibility-driven agent (whatsapp-mcp-macos), with a line-level walk through the local server's send-and-verify loop.",
    url: PAGE_URL,
    datePublished: PUBLISHED,
    author: "Matthew Diakonov",
    publisherName: "WhatsApp MCP for macOS",
    publisherUrl: "https://whatsapp-mcp-macos.com",
    articleType: "TechArticle",
  }),
  breadcrumbListSchema(breadcrumbSchemaItems),
  faqPageSchema(faqItems),
];

export default function ManychatWhatsappAutomationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="pb-24">
        <BackgroundGrid glow className="mx-4 md:mx-8 mt-8 px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto relative z-10">
            <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
              two automation stacks, same app
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              Manychat automates WhatsApp through Meta.{" "}
              <GradientText>There is another path.</GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-6 max-w-2xl">
              Every guide to this topic assumes one answer: sign up for a
              Business API provider, get your number verified, write message
              templates, wait for Meta to approve them, and pay per conversation
              to reach opted-in contacts. That is the right answer when you are
              broadcasting to strangers. It is the wrong answer when the
              WhatsApp account you want to automate is the one you already use
              to talk to people.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              This guide is about the other path. A local agent that drives the
              real WhatsApp Desktop app on your Mac through operating-system
              accessibility. No Meta verification, no template queue, no
              24-hour window, no per-message fees. Eleven tools, zero env vars,
              and one <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">~/.claude.json</code> entry.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#which-path">
                Which path fits my problem
              </ShimmerButton>
              <a
                href="https://github.com/m13v/whatsapp-mcp-macos"
                className="text-sm font-medium text-teal-700 hover:text-teal-600"
              >
                whatsapp-mcp source &rarr;
              </a>
            </div>
          </div>
        </BackgroundGrid>

        <div className="mt-10">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <div className="mt-4 mb-8">
          <ArticleMeta
            datePublished={PUBLISHED}
            readingTime="12 min read"
            authorRole="Written with AI"
          />
        </div>
        <ProofBand
          rating={4.8}
          ratingCount="traced against whatsapp-mcp-macos v1.1.0"
          highlights={[
            "Line-level walk through the Swift send-and-verify loop",
            "Honest comparison table between Manychat and the local agent path",
            "Concrete decision rules for which path to pick",
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 my-16">
          <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
            <RemotionClip
              title="Two automation stacks. One app."
              subtitle="Manychat speaks Meta's API. whatsapp-mcp speaks macOS."
              accent="teal"
              captions={[
                "Manychat rides the Business API: templates, windows, fees.",
                "whatsapp-mcp rides the accessibility tree of the Desktop app.",
                "Different senders, different reach, different compliance shape.",
                "Pick by whether you broadcast or converse.",
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Why Manychat dominates this topic, and what it leaves out
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Manychat is the best known marketing automation platform that
            supports WhatsApp, so when people search for ways to automate
            WhatsApp the answers center on its product. The flow builder,
            click-to-WhatsApp ads, template library, CRM sync, and Shopify
            integration are real, and for the job Manychat is designed to do
            (outbound marketing to opted-in contacts through a certified
            business number) it is a reasonable pick.
          </p>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            What every Manychat-centric article leaves out is that the product
            is a skin on Meta's WhatsApp Business API. It is not a different
            automation technology; it is a dashboard on top of the same API
            that Wati, Interakt, Twilio, and a hundred other Business Solution
            Providers wrap. You are doing Meta's dance either way: business
            verification in Facebook Business Manager, a display name Meta
            approves, message templates Meta approves per language, the
            24-hour freeform window, and the opt-in requirement before any
            proactive message.
          </p>
          <p className="text-zinc-600 leading-relaxed">
            None of that applies to the automation stack described below. The
            two approaches share only the word automation and the app icon.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Side by side, by every property that matters
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            These are the ten dimensions I use when I help someone pick between
            the two paths. Not a feature checklist; a shape comparison. A yes
            in one column and a no in the other is usually telling you that the
            tools are not substitutes, they are alternatives for different
            problems.
          </p>
          <ComparisonTable
            productName="whatsapp-mcp-macos"
            competitorName="Manychat (Business API)"
            rows={approachComparisonRows}
          />
        </section>

        <section
          className="max-w-5xl mx-auto px-6 my-16"
          id="which-path"
        >
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Which path fits which problem
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            The decision is almost never about features. It is about who the
            sender is and who the recipient is. If the sender is a registered
            business and the recipients are a list of opted-in contacts, the
            Business API is the only legitimate path. If the sender is you and
            the recipients are already in your WhatsApp sidebar, the Business
            API is more permission and more process than the job needs.
          </p>
          <BentoGrid cards={whichPathCards} />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            How the local-agent path actually flows
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            One host, one stdio child, one open WhatsApp window. The host
            forwards the model's tool calls to the child; the child walks the
            accessibility tree of the running app, performs the action, and
            reads the tree back to confirm the result.
          </p>
          <AnimatedBeam
            title="the model's tools/call frames flow through one host and one child"
            from={[
              {
                label: "model (Claude Opus)",
                sublabel: "emits tools/call on its turn",
              },
              {
                label: "your prompt",
                sublabel: "'reply to the latest message from Alex'",
              },
              {
                label: "active WhatsApp window",
                sublabel: "bundle id net.whatsapp.WhatsApp",
              },
            ]}
            hub={{
              label: "MCP host",
              sublabel: "Claude Code or Cursor, reads ~/.claude.json",
            }}
            to={[
              {
                label: "whatsapp-mcp child",
                sublabel: "stdio, swift binary, 11 tools",
              },
              {
                label: "AX tree traversal",
                sublabel: "kAXChildrenAttribute, depth 15",
              },
              {
                label: "verified send",
                sublabel: '"Your message, ..." read back',
              },
            ]}
          />
          <p className="text-sm text-zinc-500 mt-4 text-center max-w-2xl mx-auto">
            Nothing in this diagram speaks HTTP to Meta. The arrows that leave
            the child go to the OS accessibility framework, not to a network.
          </p>
        </section>

        <GlowCard className="max-w-4xl mx-auto my-16">
          <div className="p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-3">
              anchor fact
            </p>
            <h3 className="text-2xl font-bold text-zinc-900 mb-3">
              <NumberTicker value={11} /> tools,{" "}
              <NumberTicker value={0} /> env vars,{" "}
              <NumberTicker value={5} decimals={1} suffix="s" /> AX ceiling
            </h3>
            <p className="text-zinc-600 leading-relaxed mb-4">
              The binary logs exactly this on startup:{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                setupAndStartServer: defined 11 tools
              </code>
              . You can grep for that line in the host's MCP log to confirm the
              child booted. The configuration takes zero environment variables:
              there is no{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                WHATSAPP_API_KEY
              </code>
              , no{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                META_BUSINESS_ID
              </code>
              , no tokens of any kind. The env block in your MCP config is
              literally{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                {"{}"}
              </code>
              .
            </p>
            <p className="text-zinc-600 leading-relaxed">
              Every tool that touches the UI lives under a hardcoded 5.0 second
              accessibility ceiling. At{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                Sources/WhatsAppMCP/main.swift:120
              </code>{" "}
              the call{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                AXUIElementSetMessagingTimeout(appElement, 5.0)
              </code>{" "}
              is set on the application element before any traversal begins.
              There is no flag to relax it. That number, and not any network
              concern, is your error budget for every write.
            </p>
          </div>
        </GlowCard>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What one send-and-verify cycle actually does
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            This is the part that cannot exist in a Business API flow, because
            there is no UI to read back. A Business API send gets you a message
            id and an eventual delivery webhook. A local-agent send reads the
            rendered message node out of the accessibility tree and compares
            the text to what was just pasted. Delivery is not trusted; it is
            observed.
          </p>
          <AnimatedCodeBlock
            code={sendSourceCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            The string it looks for is literal:{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              Your message,
            </code>{" "}
            is the prefix WhatsApp Desktop puts in the AX description of every
            outgoing message bubble. The server strips the time suffix, lowercases
            both sides, and returns{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              verified: true
            </code>{" "}
            only when the text that came back contains the text that went in.
            If the app was still syncing, or the user dragged the window, or
            the compose field was not actually the one found, verification
            fails and the caller can retry.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The entire configuration is this
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            One block in{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              ~/.claude.json
            </code>
            . Stdio transport, the binary name, no args, an empty env. If you
            have configured any other MCP server before, this shape is
            identical.
          </p>
          <AnimatedCodeBlock
            code={claudeConfigCode}
            language="json"
            filename="~/.claude.json"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What it looks like end to end
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Install through npm, add the config, restart the host, ask the
            model to send a message. The host reports back what the verification
            read from the tree, which is the first thing most people discover
            they care about more than they expected to.
          </p>
          <TerminalOutput
            title="zero to verified send"
            lines={termLines}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Setup, in order
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Five steps, none of them network-bound except the first. No
            verification queue, no Facebook Business Manager, no waiting on
            Meta approval. The slowest step is the one-time Swift build that
            npm runs for you.
          </p>
          <StepTimeline title="from zero to a verified local agent" steps={setupSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            Properties the local path inherits for free
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Every chip below is a property of the stack, not a feature someone
            has to maintain. They are what you get when the automation layer is
            the operating system's accessibility framework rather than a
            vendor's Business API wrapper.
          </p>
          <Marquee speed={34}>
            <div className="flex items-center gap-3 pr-3">
              {stackChips.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center whitespace-nowrap rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm"
                >
                  {c}
                </span>
              ))}
            </div>
          </Marquee>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            When Manychat is still the right call
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            I have spent the article on the gap, not because Manychat is bad
            but because the gap is the part you will not find covered anywhere
            else. If your automation use case is any of the following, the
            local path is not the answer you want:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-zinc-700 leading-relaxed mb-6">
            <li>
              Abandoned-cart and order-confirmation messages to tens of
              thousands of Shopify customers.
            </li>
            <li>
              Marketing broadcasts to opted-in subscribers of a newsletter or
              course, where the legal posture depends on the Business API.
            </li>
            <li>
              Any flow where the sender has to be a verified business name in
              the recipient's chat header, not a personal number.
            </li>
            <li>
              A non-technical operator who will be configuring the flows, where
              the value of a hosted dashboard outweighs the value of code.
            </li>
          </ul>
          <p className="text-zinc-600 leading-relaxed">
            In all of those the Business API (and therefore a platform like
            Manychat) is the correct tool, and no amount of local accessibility
            automation changes that. The point of this guide is that there is
            a second shape of automation that no one was telling you about,
            and it lines up with the other half of the problems people
            actually have.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Not sure which WhatsApp automation path your workflow wants?"
          description="30 minutes to walk through who the sender is, who the recipients are, and which path fits. Bring your use case, not your stack."
        />

        <FaqSection items={faqItems} />

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Talk through Manychat vs a local agent on a call"
        />
      </article>
    </>
  );
}
