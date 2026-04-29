import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  BackgroundGrid,
  GradientText,
  AnimatedCodeBlock,
  ComparisonTable,
  TerminalOutput,
  StepTimeline,
  BeforeAfter,
  ProofBanner,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://whatsapp-mcp-macos.com/alternative/mcp-server-vs-api";
const PUBLISHED = "2026-04-29";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "MCP server vs API, walked through one real workflow (sending a WhatsApp message)",
  description:
    "Most takes on MCP server vs API stay abstract. This one picks one workflow (sending a friendly WhatsApp message to someone you have been chatting with) and walks it down both paths: the WhatsApp Business Cloud API on one side, the WhatsApp MCP server for macOS on the other. Gates, code, and the actual delivery confirmation on each.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "MCP server vs API, walked through one real workflow",
    description:
      "Same operation, two paths. The Business Cloud API needs a verified business, opt-in templates, and per-message billing. The MCP server reads the chat bubble back as the receipt. Here is what each side actually looks like in code.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "MCP server vs API, traced through one operation",
    description:
      "Send one WhatsApp message. Watch the question 'MCP vs API' stop being abstract and become a binary choice driven by who owns the data on the other side.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Alternatives", href: "/alternative" },
  { label: "MCP server vs API" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Alternatives", url: "https://whatsapp-mcp-macos.com/alternative" },
  { name: "MCP server vs API", url: PAGE_URL },
];

const apiSetupSteps = [
  {
    title: "Stand up a Meta Business account and get verified",
    description:
      "Create the Business Manager, add legal entity details, upload incorporation papers, and wait for Meta to verify the business. The first message cannot leave the WhatsApp Business Platform until this clears.",
  },
  {
    title: "Register a phone number that is not your personal one",
    description:
      "The number used for the Business Cloud API has to be separate from any number signed in to the consumer WhatsApp app. Once registered for the platform, you cannot use it on a phone the normal way without deregistering first.",
  },
  {
    title: "Submit message templates and wait for category approval",
    description:
      "Anything sent outside an active 24-hour customer service window has to be a template that Meta has approved and categorized as Marketing, Utility, or Authentication. Each template is reviewed individually.",
  },
  {
    title: "Collect explicit opt-in for every recipient",
    description:
      "Meta's policy requires recorded opt-in (a checkbox the user ticked, a missed call they made, a Click-to-WhatsApp ad they clicked) before a business can send any template to that user. The opt-in record has to survive an audit.",
  },
  {
    title: "Wire a webhook to receive delivery and read receipts",
    description:
      "Sent, delivered, read, and failed events arrive on a webhook the business operates. There is no synchronous reply that says 'message arrived', so the integration code has to keep state and reconcile asynchronously.",
  },
  {
    title: "Pay per message after the free service window",
    description:
      "After Meta moved to per-message pricing in mid-2025, every delivered template is billed by category and country. Marketing templates run roughly $0.025 to $0.1365 each. Replies inside the 24-hour service window remain free.",
  },
];

const mcpSetupSteps = [
  {
    title: "Install the npm package on your Mac",
    description:
      "One command, no signup, no API key. The package ships a Swift binary that drives the WhatsApp Catalyst app via macOS accessibility APIs.",
  },
  {
    title: "Grant Accessibility to the parent terminal",
    description:
      "System Settings, Privacy and Security, Accessibility, add the terminal (or Claude Code, Cursor, etc.) that will host the MCP server. This is the entire permission grant.",
  },
  {
    title: "Add an mcpServers entry pointing at whatsapp-mcp",
    description:
      "Drop a stdio entry into the host config (~/.claude.json under mcpServers, Cursor's mcp.json, etc.). Restart the host or rerun /mcp. Tools appear in tools/list immediately.",
  },
  {
    title: "Use your already-signed-in WhatsApp account",
    description:
      "The MCP server acts on the same WhatsApp the human is already using. There is no separate registration, no template review, no opt-in record to keep. Your account is the credential.",
  },
];

const verificationCode = `// Sources/WhatsAppMCP/main.swift
// handleSendMessage, post-send verification block.
// This is the entire delivery confirmation path.

pressReturn()
Thread.sleep(forTimeInterval: 1.0)

// Re-walk the WhatsApp accessibility tree after the send.
let postElements = traverseAXTree(pid: pid)
let genericElements = findElements(in: postElements,
                                   role: "AXGenericElement")

var lastSentMessage: String? = nil
for el in genericElements {
    let desc = cleanUnicode(el.description ?? "")
    if desc.hasPrefix("Your message, ") {
        // Strip the trailing ", 4:21 PM" timestamp.
        let rest = String(desc.dropFirst("Your message, ".count))
        var text = rest
        if let timeRange = text.range(
            of: #",\\s+\\d{1,2}:\\d{2}\\s*[APap][Mm]"#,
            options: .regularExpression) {
            text = String(text[text.startIndex..<timeRange.lowerBound])
        }
        lastSentMessage = text.trimmingCharacters(
            in: CharacterSet(charactersIn: ", "))
    }
}

// verified == true iff what we typed matches the bubble we now see.
// No webhook. No Meta endpoint. The chat is the receipt.`;

const apiSendCode = `// What "send a message" looks like via the WhatsApp Business Cloud API.
// You also need: a verified business, an approved template, opt-in,
// and a webhook receiving status callbacks asynchronously.

const res = await fetch(
  \`https://graph.facebook.com/v21.0/\${PHONE_NUMBER_ID}/messages\`,
  {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${ACCESS_TOKEN}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: "15551234567",
      type: "template",
      template: {
        name: "hello_friendly_v2",      // pre-approved, categorized
        language: { code: "en_US" },
        components: [
          { type: "body", parameters: [{ type: "text", text: "Sam" }] },
        ],
      },
    }),
  },
);

// 200 here means "Meta accepted the request", not "delivered".
// Delivery, read receipts, and failures arrive later on the webhook.`;

const compareRows = [
  {
    feature: "What 'send a message' actually requires",
    competitor:
      "Verified business, separate registered number, approved template, opted-in recipient, webhook for receipts.",
    ours: "Be the human signed into WhatsApp on a Mac. Grant Accessibility to your terminal once.",
  },
  {
    feature: "Per-message cost in 2026",
    competitor:
      "Marketing template $0.025 to $0.1365, utility/auth $0.004 to $0.0456, varies by recipient country.",
    ours: "Free. MIT-licensed npm package, runs locally as a stdio child of the AI host.",
  },
  {
    feature: "Time from zero to first message",
    competitor:
      "Days to weeks (business verification + template review queue, longer in regulated regions).",
    ours: "Minutes. npm install, Accessibility toggle, restart host, send.",
  },
  {
    feature: "Account on the other end",
    competitor:
      "A registered Business Cloud API number that no longer works in the consumer app the normal way.",
    ours: "Your own WhatsApp account, exactly as you already use it.",
  },
  {
    feature: "What can be sent outside the 24-hour service window",
    competitor:
      "Only pre-approved templates in Marketing, Utility, or Authentication categories.",
    ours: "Whatever a person can type into a chat themselves.",
  },
  {
    feature: "Who is allowed to receive the message",
    competitor:
      "Only users who gave recorded opt-in. Marketing templates can be silently filtered if the user toggled them off.",
    ours: "Anyone the human signed in could already message from the desktop app.",
  },
  {
    feature: "Delivery confirmation",
    competitor:
      "Async webhook events: sent, delivered, read, failed. Integration has to track state.",
    ours:
      "Synchronous: 1.0s after the send, re-walk the AX tree and look for an AXGenericElement whose description begins with 'Your message, '.",
  },
  {
    feature: "Failure surface the agent has to handle",
    competitor:
      "401 (token), 403 (scope), 429 (rate), webhook never arrives, template paused, recipient toggled marketing off.",
    ours:
      "Compose field not found, paste failed, bubble not visible after 1.0s, WhatsApp app not running.",
  },
  {
    feature: "Multi-tenant safety",
    competitor:
      "Strong. Token scopes the integration to one Business Account; Meta enforces every call.",
    ours:
      "Single-tenant by construction. The MCP runs on the operator's Mac and acts as them. Not a model for SaaS access.",
  },
  {
    feature: "Where it runs",
    competitor: "Anywhere with internet. Hosted by your backend or a CPaaS.",
    ours: "On the same Mac as the WhatsApp Catalyst app. Local stdio only.",
  },
];

const installLines = [
  { text: "npm install -g whatsapp-mcp-macos", type: "command" as const },
  { text: "added 1 package in 6s", type: "output" as const },
  { text: "whatsapp-mcp installed at /usr/local/bin/whatsapp-mcp", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "Add to ~/.claude.json under mcpServers, then restart the host.", type: "info" as const },
  { text: "claude mcp list", type: "command" as const },
  { text: "whatsapp  stdio  whatsapp-mcp                  connected", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "claude --print 'send Sam a quick message saying hi'", type: "command" as const },
  { text: "tools/call whatsapp_search { name: 'Sam' }", type: "output" as const },
  { text: "tools/call whatsapp_open_chat { index: 0 }", type: "output" as const },
  { text: "tools/call whatsapp_send_message { message: 'hi!' }", type: "output" as const },
  {
    text: '{"success": true, "verified": true, "to": "Sam", "message": "hi!"}',
    type: "success" as const,
  },
];

const faqItems = [
  {
    q: "Is the WhatsApp Business Cloud API the only 'API' alternative to the MCP server?",
    a: "For sending messages from a real WhatsApp number, yes. Meta does not offer a consumer-grade WhatsApp REST API. The Business Cloud API and the older On-Premises API both target verified businesses and require pre-approved templates outside the 24-hour customer service window. There is no first-party endpoint that lets a logged-in personal user send a message via HTTP. So when you compare 'MCP server vs API' for WhatsApp, the API on the table is the Business Cloud API. That is what makes the comparison concrete instead of abstract: the MCP server reaches the user's own account through the desktop app; the API reaches a separately-registered business number through Meta's platform. Pick the one whose access pattern matches your use case.",
  },
  {
    q: "How much does the WhatsApp Business Cloud API actually cost per message?",
    a: "Meta switched from conversation-based to per-message pricing on July 1, 2025. Marketing templates run roughly $0.025 to $0.1365 per delivered message depending on the recipient's country. Utility and authentication templates run roughly $0.004 to $0.0456. Replies inside an open 24-hour customer service window (started by an inbound message) are free. Click-to-WhatsApp ads and Facebook Page CTA buttons open a 72-hour free entry point. Country, monthly volume, and category all change the per-message rate. The WhatsApp MCP server, by contrast, is MIT-licensed and runs locally, so the marginal cost of a message is whatever your AI host charges for the tokens.",
  },
  {
    q: "What does delivery confirmation look like in each path?",
    a: "On the Business Cloud API, the synchronous response to POST /messages is just an acceptance: Meta queued the message. Real delivery status arrives later as webhook events (sent, delivered, read, failed). Your integration has to keep state and reconcile asynchronously, which means you also need a public HTTPS endpoint and a database row per outgoing message. On the WhatsApp MCP server, confirmation is synchronous and local. After pressing return, the server sleeps 1.0 seconds, re-walks the WhatsApp accessibility tree, collects every AXGenericElement, and looks for one whose accessibility description begins with the literal prefix 'Your message, '. It strips the trailing time suffix with the regex ',\\s+\\d{1,2}:\\d{2}\\s*[APap][Mm]' and compares the remaining text against what was typed. If they match, the JSON-RPC response carries verified:true. If the bubble exists but the text does not match, it carries verified:false plus the visible bubble in a warning field. The chat itself is the receipt.",
  },
  {
    q: "Why can the MCP server skip opt-in and template approval that the API requires?",
    a: "Because the MCP server is not 'a business reaching a consumer.' It is the operator's own WhatsApp client doing what the operator could do themselves. Meta enforces opt-in and templates on the Business platform because that side is for outbound business messaging at scale, where the policy concern is unsolicited bulk contact. Driving your own desktop app is policy-equivalent to typing the messages yourself. That said, this is not a license to spam: the WhatsApp consumer terms still apply, and using the MCP server to mass-message strangers will get the underlying account banned the same way doing it manually would.",
  },
  {
    q: "What can the API path do that the MCP server cannot?",
    a: "Three things stand out. First, scale: the Business Cloud API is built for high-volume outbound (think tens of thousands of opted-in shipping notifications), and the MCP server is bottlenecked by one desktop app on one Mac. Second, multi-tenant SaaS: the API gives you per-tenant tokens you can hand to product code that serves many users, while the MCP server is single-tenant by construction. Third, hosted operation: the API runs from your backend, while the MCP needs the Mac and the desktop app to be on. If your use case is 'opt-in transactional messaging at volume from a verified business,' the API is the right tool and the MCP server is the wrong one. The MCP server is the right tool for the inverse: agentic personal use, solo founders routing inbound, internal automations on your own number.",
  },
  {
    q: "What can the MCP server do that the API path cannot?",
    a: "Read your existing chats and groups, search your real contact list, message a personal contact that never opted in to a business platform, work in a 24-hour-window-agnostic way (you can send a chatty message at any time because you are the human), and run with zero Meta paperwork. Also: it works for any account, including ones for which a Business Cloud API registration would not make sense (your own number that you also use for friends, a small group's coordination number, a non-business personal account that your agent operates).",
  },
  {
    q: "Is the MCP server architecture just a worse, slower version of the API?",
    a: "It is slower per message and lower in throughput, sure. The single-message latency is dominated by the post-send 1.0-second sleep before the AX-tree re-walk, plus the time to traverse the tree (typically a couple hundred milliseconds). The Business Cloud API call itself is a single HTTPS round-trip. But the comparison only matters if both can do the work at all. For personal/individual messaging, the API path cannot do the work at any speed because the policy gates exclude it. The MCP server is not a faster or slower version of the API path; it is the only path for that use case.",
  },
  {
    q: "Could the MCP server be replaced by a hosted WhatsApp Web automation service?",
    a: "There are CPaaS vendors (Twilio, MessageBird, others) that resell the Business Cloud API, and a handful of grey-market 'WhatsApp Web automation' services that drive the web client through Selenium-style scripts on a remote server. The CPaaS resellers inherit all the same gates as the underlying Business API: verified business, templates, opt-in. The web-automation grey market inherits a different set of problems: WhatsApp's web client is the most heavily monitored automation surface Meta operates, accounts get banned regularly, and the legal posture is shaky. Driving your own desktop app on your own Mac via the OS-level accessibility framework is what is left when you want neither.",
  },
  {
    q: "What is the correct mental model for 'MCP server vs API' in general, not just WhatsApp?",
    a: "MCP and API are two layers, not two competitors. An MCP server is the contract an AI host speaks (JSON-RPC, typed tools, runtime discovery). The API, if one exists, is what the MCP server uses on the back. Most MCP servers in the wild for SaaS products (Stripe, Linear, Notion, GitHub, Box) are thin wrappers over the vendor's existing REST API, and there 'MCP vs API' is a question about packaging. But there is a second class of MCP server, the kind that has no API to wrap because the system on the other side does not expose one usable by a single human. That class includes WhatsApp consumer messaging, iMessage, Apple Notes, Calendar.app, most Catalyst apps. For those, the MCP server has to drive a running app instance through the OS, and 'MCP vs API' is no longer about packaging; it is about which path exists at all. Knowing which class your target system falls into is the first design decision.",
  },
  {
    q: "Can both paths be used at once from the same agent?",
    a: "Yes, MCP hosts are designed for that. A single host config can list a WhatsApp Business Cloud API MCP wrapper (for the verified-business outbound flow) and the local accessibility-driven WhatsApp MCP server (for the operator's personal account) side by side. The agent sees both tool surfaces in one tools/list and can route each task to the appropriate one. The most common practical setup is the inverse though: most users want the local MCP server because they do not have, and do not want, a Business Cloud API registration just to let an agent ping a friend.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "MCP server vs API, walked through one real workflow (sending a WhatsApp message)",
    description:
      "A worked-example comparison of MCP servers and APIs through one operation: sending a friendly WhatsApp message to someone you have been chatting with. The API path is the WhatsApp Business Cloud API with verified-business gates and per-message billing. The MCP path is a local Swift binary that drives the macOS WhatsApp Catalyst app via accessibility APIs and confirms delivery by re-reading the chat bubble. Includes the specific code path, the actual gates on each side, and a per-feature comparison.",
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

export default function McpServerVsApiPage() {
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
              MCP server vs API, made concrete
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              MCP server vs API, walked through one workflow:{" "}
              <GradientText>
                send a WhatsApp message to someone you have been chatting with.
              </GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-6 max-w-2xl">
              The most common takes on this question stay at the level of
              philosophy: APIs are for developers, MCP is for AI, MCP wraps
              APIs, MCP is stateful, REST is stateless. All true. None of it
              tells you which path you actually walk down for the thing you are
              trying to build.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              So here is the question made concrete. Pick one operation, one
              vendor (WhatsApp), one user (a person who already chats with the
              recipient), and trace it down both paths. The API path is the{" "}
              <a
                href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
              >
                WhatsApp Business Cloud API
              </a>
              . The MCP path is the{" "}
              <a
                href="https://github.com/m13v/whatsapp-mcp-macos"
                className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
              >
                WhatsApp MCP server for macOS
              </a>
              . They look almost nothing alike on the way to doing the same
              thing.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#trace-the-paths"
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                Trace both paths
              </a>
              <a
                href="#decision"
                className="text-sm font-medium text-teal-700 hover:text-teal-600"
              >
                Skip to the decision &rarr;
              </a>
            </div>
          </div>
        </BackgroundGrid>

        <div className="mt-10 max-w-4xl mx-auto px-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <div className="mt-4 mb-8 max-w-4xl mx-auto px-6">
          <ArticleMeta
            datePublished={PUBLISHED}
            readingTime="11 min read"
            author="Matthew Diakonov"
            authorRole="Written with AI"
          />
        </div>

        <section className="max-w-3xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Why the abstract framing leaves you stuck
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            If you read four or five existing pieces on this question you will
            find the same shape every time. There is a definition of MCP, a
            definition of REST, a paragraph about how the model decides which
            tool to call, and a closing line about how MCP and APIs are
            complementary, not competing. That paragraph is correct. It is also
            useless when you are sitting in front of an editor trying to decide
            what to actually build for a specific operation.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The decision becomes obvious the moment you pick a vendor and a
            workflow. Some vendors give you a clean public REST API plus OAuth
            plus a per-resource permission model, and the MCP server for them is
            a small typed wrapper over the same surface a partner integration
            would have used a year ago. Stripe, Linear, Notion, GitHub, Box are
            all in that bucket. There the question is essentially &quot;do I
            want the typed JSON-RPC packaging or the raw HTTP one,&quot; which
            is interesting but low-stakes.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            Other vendors do not give you an API usable by a single human at
            all, only an API for a separate registered business persona. There
            the question stops being about packaging and becomes about which
            path can do the work in the first place. WhatsApp consumer
            messaging is the canonical example, which is why it is the example
            this page uses.
          </p>
        </section>

        <section id="trace-the-paths" className="max-w-3xl mx-auto px-6 my-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The setup steps for each path, before a single message goes out
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Same goal: an AI agent should be able to send a friendly note to a
            real person on WhatsApp. The lead time, the dependencies, and the
            ongoing obligations are wildly different.
          </p>

          <StepTimeline
            title="API path: WhatsApp Business Cloud API"
            steps={apiSetupSteps}
          />

          <StepTimeline
            title="MCP path: WhatsApp MCP server for macOS"
            steps={mcpSetupSteps}
          />

          <p className="text-zinc-700 leading-relaxed mt-8">
            The API path is correct for a verified business at scale; nothing
            on its list is unreasonable for that audience. It is just the
            wrong audience for &quot;a person whose AI agent should ping a
            friend,&quot; and there is no smaller version of it on offer.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What &quot;send one message&quot; looks like in code
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            On the API side, the call itself is short. The work is the
            preconditions: a token tied to a verified business, a template that
            Meta has reviewed and categorized, an opted-in recipient, and a
            webhook ready to receive what happens later.
          </p>

          <AnimatedCodeBlock
            code={apiSendCode}
            language="javascript"
            filename="WhatsApp Business Cloud API call (TypeScript)"
          />

          <p className="text-zinc-700 leading-relaxed mt-8 mb-6">
            On the MCP side, three tool calls and a synchronous result. The
            interesting code is not the send; it is what happens 1.0 second
            after the send, when the server reads the chat itself to verify
            that the bubble it just typed is now visible.
          </p>

          <AnimatedCodeBlock
            code={verificationCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />

          <ProofBanner
            metric="0 webhooks"
            quote="The chat is the receipt. There is no Meta endpoint to ask whether the message arrived. The MCP server re-reads the AX tree of the running WhatsApp app and looks for an AXGenericElement whose accessibility description begins with the literal prefix 'Your message, '."
            source="Sources/WhatsAppMCP/main.swift, the post-send block of handleSendMessage"
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 my-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What it actually feels like to install and run the MCP path
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            For comparison with the multi-week verified-business onboarding,
            here is the entire setup-to-first-message loop on the MCP side. It
            assumes you already have WhatsApp signed in on your Mac, which you
            probably do.
          </p>
          <TerminalOutput lines={installLines} title="zsh" />
        </section>

        <section className="max-w-3xl mx-auto px-6 my-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What changes for the recipient
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Toggle the buttons below. The same person, on the same number, has
            a noticeably different experience depending on which path the
            sender used. This is the part that often surprises people who have
            only ever read about the Business Cloud API in marketing copy.
          </p>

          <BeforeAfter
            title="Same recipient, two different message origins"
            before={{
              label: "Message via Business Cloud API",
              content:
                "The recipient sees the message arrive from a registered business number that they have not chatted with before (or have only ever chatted with as a customer of that business). The bubble shape, sender label, and reply controls are slightly different from a friend's chat. WhatsApp sometimes flags it with a 'business' label. If the message is a marketing template and the recipient has marketing toggled off in their WhatsApp settings, it will not be delivered at all. There is no chat history continuity with the operator's personal account.",
              highlights: [
                "Message comes from a separate business number, not the operator's personal one",
                "Outside the 24h service window, only pre-approved templates are deliverable",
                "Marketing templates are silently filtered for users who toggled marketing off",
                "Sender cannot reuse their existing chat history or relationship context",
              ],
            }}
            after={{
              label: "Message via WhatsApp MCP for macOS",
              content:
                "The recipient sees a normal message in the same chat thread they have been using all along, from the same number the operator always uses. There is no business label, no template, no opt-in screen. From the recipient's side, it is indistinguishable from the operator typing the message themselves on their Mac, because effectively that is what is happening. WhatsApp's UI does not annotate it. The MCP server is just driving the keyboard and clipboard.",
              highlights: [
                "Comes from the operator's existing WhatsApp account and existing chat thread",
                "No 24h window, no template, no opt-in record needed",
                "Indistinguishable from the operator typing it on their own Mac",
                "Reuses the full chat history and relationship context",
              ],
            }}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-20">
          <ComparisonTable
            heading="Same operation, two paths, side by side"
            intro="Sending one message to one person. WhatsApp Business Cloud API on the left. WhatsApp MCP for macOS on the right. Cost numbers are the public Meta rates as of 2026."
            productName="WhatsApp MCP (macOS)"
            competitorName="WhatsApp Business Cloud API"
            rows={compareRows}
          />
        </section>

        <section id="decision" className="max-w-3xl mx-auto px-6 my-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            How to decide for your own use case
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The decision is not really &quot;MCP server vs API&quot; in the
            abstract. It is &quot;does the API the vendor exposes match the
            shape of the work I want done.&quot; For WhatsApp, the answer
            splits cleanly along one line: are you a verified business sending
            to opted-in people at scale, or are you a single human (or a small
            team operating one number) who wants an agent to act on your
            behalf?
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            <strong className="text-zinc-900">Pick the API path</strong> if you
            are a real business, your messages are templated, you have a
            documented opt-in process, you can run a webhook receiver, and
            you are willing to pay per message. The Business Cloud API is the
            right tool for shipping notifications, OTP delivery,
            customer-service routing, and opted-in marketing. It scales,
            it is multi-tenant, and the per-message economics work at volume.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            <strong className="text-zinc-900">Pick the MCP server path</strong>{" "}
            if you are on a Mac, the WhatsApp account that should send the
            message is already signed in there, and the recipients are people
            you already chat with normally. That covers solo founders routing
            inbound, builders wiring agents into their own message stream,
            internal coordination on a personal number, and any case where
            the relationship between sender and recipient is &quot;two people
            who text each other,&quot; not &quot;a business reaching a
            customer.&quot; It also covers the cases the API path explicitly
            refuses to cover.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            Both can coexist in one MCP host config: one stdio entry pointing
            at the local accessibility-driven server, one HTTP entry pointing
            at a Cloud-API-wrapping MCP, and the agent picks based on which
            account is supposed to send. That is the configuration to reach
            for if you want both audiences served by the same workflow.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Stuck choosing the path for your own workflow?"
          description="If you have a specific operation in mind and you cannot tell whether it wants an API wrapper or an accessibility-driven MCP, book 30 minutes. Faster than reading another framework comparison."
        />

        <section className="max-w-3xl mx-auto px-6 my-16">
          <FaqSection items={faqItems} />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Talk through the right MCP path for your workflow in 30 min."
        />
      </article>
    </>
  );
}
