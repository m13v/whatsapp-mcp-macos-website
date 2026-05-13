import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  ComparisonTable,
  ProofBanner,
  BookCallCTA,
  GlowCard,
  BeforeAfter,
  StepTimeline,
  MetricsRow,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/alternative/whatsapp-desktop-vs-cloud-api";
const PUBLISHED = "2026-05-13";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "WhatsApp desktop automation vs Cloud API: pick by throughput, not features",
  description:
    "Most comparisons frame this as personal vs verified business. The real decision axis is wall-clock throughput. Desktop automation hits a hard ceiling near 15 messages per minute on one Mac, measured from the actual Thread.sleep timings in handleSendMessage. The Cloud API has no equivalent ceiling but asks for verified-business onboarding and async webhook handling. Here is the latency budget on both sides and the math that decides for you.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "WhatsApp desktop automation vs Cloud API: pick by throughput, not features",
    description:
      "Real latency budget from real code. Desktop automation runs at ~4 seconds per verified message, ceiling near 15/min. Cloud API ACKs in ~300ms and confirms delivery on an async webhook. The choice is throughput, not personal-vs-business.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "WhatsApp desktop automation vs Cloud API, decided by one number",
    description:
      "Wall-clock throughput is the axis. ~15 messages per minute on a Mac driving the desktop app; effectively unbounded through the Cloud API. Everything else falls out of that.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Alternatives", href: "/alternative" },
  { label: "Desktop automation vs Cloud API" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  {
    name: "Alternatives",
    url: "https://whatsapp-mcp-macos.com/alternative",
  },
  { name: "Desktop automation vs Cloud API", url: PAGE_URL },
];

const desktopSendCode = `// Sources/WhatsAppMCP/main.swift, handleSendMessage (excerpt)
// Every Thread.sleep below is wall-clock time on the box doing the work.

func handleSendMessage(args: [String: Value]?) throws -> String {
    if let err = requireAccessibility() { return err }
    let message = try getRequiredString(from: args, key: "message")
    let pid = try ensureWhatsAppRunning()
    activateWhatsApp(pid: pid)
    Thread.sleep(forTimeInterval: 0.3)              // 0.3s: app activation

    // ... locate compose field via AX tree (one full traversal, ~150-300ms)

    clickElement(compose)
    Thread.sleep(forTimeInterval: 0.3)              // 0.3s: post-click settle

    guard pasteText(message) else { ... }            // Cmd+V, ~0.35s internal
    Thread.sleep(forTimeInterval: 0.3)              // 0.3s: post-paste settle

    pressReturn()
    Thread.sleep(forTimeInterval: 1.0)              // 1.0s: bubble must render

    // Post-send verification: re-walk the tree (second full traversal),
    // look for an AXGenericElement whose accessibility description starts
    // with the literal prefix "Your message, ". Match means delivered.
    let postElements = traverseAXTree(pid: pid)
    let genericElements = findElements(in: postElements,
                                       role: "AXGenericElement")
    // ... compare lastSent to what we typed -> verified: true / false
}`;

const cloudApiSendCode = `// One message via the WhatsApp Cloud API.
// HTTP returns ~300ms with "Meta accepted the request".
// True delivery (delivered/read/failed) lands later on YOUR webhook.

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
        name: "order_confirmation_v3",   // pre-approved by Meta
        language: { code: "en_US" },
        components: [
          { type: "body", parameters: [{ type: "text", text: "Sam" }] },
        ],
      },
    }),
  },
);
const { messages: [{ id }] } = await res.json();    // ~300ms

// Now you wait for webhook events:
//   POST /webhooks/whatsapp  { ... statuses: [{ id, status: "sent"      }] }
//   POST /webhooks/whatsapp  { ... statuses: [{ id, status: "delivered" }] }
//   POST /webhooks/whatsapp  { ... statuses: [{ id, status: "read"      }] }
// Each event arrives async. Your integration keeps state and reconciles.`;

const decisionRows = [
  {
    feature: "Wall-clock per verified message",
    competitor:
      "~300ms for the HTTP ACK. True delivery confirmation lands later on a webhook, typically 1-30s after send, sometimes minutes.",
    ours:
      "~4 seconds for the full send-plus-verify cycle. 1.9s of explicit Thread.sleep in handleSendMessage, plus two AX tree traversals (~300-600ms combined), plus the OS-level paste and keystroke time.",
  },
  {
    feature: "Throughput ceiling per sending unit",
    competitor:
      "Effectively unbounded. Meta documents rate tiers from 1K to unlimited unique users per 24h based on quality rating. The Graph API itself accepts hundreds of requests per second per phone number.",
    ours:
      "About 15 messages per minute on one Mac running one WhatsApp app. Strictly serial because the WhatsApp window is a singleton UI you are typing into.",
  },
  {
    feature: "Delivery confirmation model",
    competitor:
      "Asynchronous. You get a message ID on ACK, then sent / delivered / read / failed events on the webhook. The integration has to keep state and reconcile.",
    ours:
      "Synchronous and in-band. After Return, the server re-reads the chat and looks for an AXGenericElement whose accessibility description begins with the literal prefix \"Your message, \". The chat is the receipt.",
  },
  {
    feature: "Sending identity",
    competitor:
      "A registered Business Cloud API number. Cannot also be signed in to consumer WhatsApp the normal way. Separate identity from your personal one.",
    ours:
      "Whatever account is signed in to the desktop app on that Mac. Usually your own personal account, used exactly as you already use it.",
  },
  {
    feature: "Opt-in and template review",
    competitor:
      "Mandatory for outbound outside the 24-hour service window. Each template categorized as Marketing, Utility, or Authentication and reviewed by Meta individually.",
    ours:
      "None. The server types into the same compose field a human would. WhatsApp's consumer terms apply.",
  },
  {
    feature: "Time to first message",
    competitor:
      "Days to weeks. Business verification, phone number registration, first template approval, opt-in collection, webhook stand-up.",
    ours:
      "Minutes. npm install -g whatsapp-mcp-macos, grant Accessibility permission, add a stdio entry to your MCP host config, restart.",
  },
  {
    feature: "Per-message cost (May 2026)",
    competitor:
      "Per-conversation pricing through Nov 2025, per-message from then. Marketing templates run roughly $0.025-$0.1365 depending on country, plus any BSP markup.",
    ours:
      "Free. MIT-licensed npm package executed locally.",
  },
  {
    feature: "Where it runs",
    competitor:
      "Meta's infrastructure. You operate a public HTTPS webhook to receive events.",
    ours:
      "Local. stdio child of your MCP host. No inbound network surface.",
  },
  {
    feature: "Multi-tenant SaaS friendly",
    competitor:
      "Yes. Per-tenant tokens, scoped permissions, audit logging, multi-number per Business Account.",
    ours:
      "No. Single-tenant by construction. One operator, one Mac, one signed-in account.",
  },
  {
    feature: "Honest fit",
    competitor:
      "Verified businesses sending opted-in transactional or marketing messages at any volume.",
    ours:
      "One human, or one AI agent on behalf of one human, having normal conversations with contacts.",
  },
];

const latencyMetrics = [
  { value: 1.9, suffix: "s", label: "Thread.sleep in handleSendMessage", decimals: 1 },
  { value: 2, suffix: "x", label: "AX tree traversals per send" },
  { value: 4, suffix: "s", label: "Typical wall-clock per verified send" },
  { value: 15, suffix: "/min", label: "Steady-state ceiling on one Mac" },
];

const decisionSteps = [
  {
    title: "How many messages per minute, in the worst hour you care about?",
    description:
      "If the answer is under 15 and the sender is one identity, desktop automation fits. If the answer is anything else (10 in parallel, 100 in a burst, sustained 30 per minute) you are in Cloud API territory.",
  },
  {
    title: "Who is the sender, legally and account-wise?",
    description:
      "If it is your personal WhatsApp number, the one you also use for friends and family, the Cloud API is not available to you without changing identities. Desktop automation is the path. If the sender is a registered legal entity sending to opted-in users, the Cloud API is the path.",
  },
  {
    title: "Is the recipient already in conversation with you?",
    description:
      "Free-form messages outside an active 24-hour conversation window require a pre-approved template on the Cloud API. Desktop automation has no template gate because it operates inside the consumer app, where free-form is the default.",
  },
  {
    title: "Do you need synchronous confirmation that the bubble appeared?",
    description:
      "Desktop automation answers synchronously by re-reading the chat. The Cloud API answers asynchronously by webhook. If your agent needs to decide what to do next based on whether the message landed, desktop automation removes a webhook from the architecture.",
  },
  {
    title: "Are you on macOS with the desktop app signed in?",
    description:
      "Desktop automation is macOS-only. It depends on the macOS Accessibility framework and the WhatsApp Catalyst app's specific accessibility tree. No Mac, no path; either run the Cloud API or pick an open-source web client.",
  },
];

const faqItems = [
  {
    q: "Where does the 15 messages per minute number come from?",
    a: "From reading the actual send code. The function handleSendMessage in Sources/WhatsAppMCP/main.swift performs four explicit Thread.sleep calls totaling 1.9 seconds (0.3s after app activation, 0.3s after clicking the compose field, 0.3s after Cmd+V paste, 1.0s after pressing Return), plus two full traversals of the WhatsApp accessibility tree (the pre-send compose-field lookup and the post-send verification walk). Each traversal walks the Catalyst app's AX tree end to end and parses every AXGenericElement, typically 150-300ms each on a recent Mac. Add the keystroke and clipboard time and one verified send lands at roughly 3.5-5 seconds, depending on chat length and machine. At that cadence the steady-state ceiling is around 12-17 messages per minute. The 15/min number rounds the middle of that range. It is a ceiling for steady state, not a burst limit.",
  },
  {
    q: "Why does the desktop path verify by re-reading the chat instead of catching a return value?",
    a: "Because the desktop app does not return one. The accessibility framework lets you click and type into another app but does not expose 'message sent' as an event you can subscribe to. The closest signal is the bubble itself appearing in the chat list, which is what a human looks at. So the server simulates that: 1.0 second after Return, it walks the accessibility tree again, collects every AXGenericElement, and looks for one whose description begins with the literal string 'Your message, '. WhatsApp's Catalyst client uses that prefix on every outgoing bubble. Match against the text we typed returns verified:true. Mismatch returns verified:false with the visible bubble in a warning field. This is the same signal the Cloud API ultimately exposes via webhooks (status: delivered), just collected from the client side instead.",
  },
  {
    q: "Can the desktop path do parallelism? Two Macs, four chats at a time?",
    a: "Yes, but only by adding hardware. The bottleneck is the WhatsApp window itself, which is a singleton UI on one OS user session. You cannot drive two chats in parallel inside one app because the compose field has one focus. The way to scale horizontally is one Mac per identity: every Mac runs its own WhatsApp app signed in to its own account, with its own MCP server. Throughput multiplies linearly with hardware. The reason most teams do not go this route past two or three Macs is operational cost; at that point the Cloud API is cheaper end-to-end even when you factor in BSP markup.",
  },
  {
    q: "Is the Cloud API's webhook actually faster than 4 seconds end to end?",
    a: "For the HTTP ACK, yes, comfortably. The Graph API returns within roughly 300ms for a valid request, and you get a message ID immediately. For the true 'message delivered' event, no. Webhooks for sent / delivered / read are async and arrive when the recipient's device acknowledges. Sent typically lands in 1-3 seconds. Delivered depends on the recipient's network. Read depends on the recipient looking at their phone. If your bar is 'I got Meta to accept this request', the Cloud API is faster than desktop automation by ~10x. If your bar is 'I know the message bubble is on the recipient's screen', the two paths land roughly in the same wall-clock window and the desktop path is the only one that gives you a synchronous answer.",
  },
  {
    q: "What about hybrid: Cloud API for outbound, desktop for inbox triage?",
    a: "That is a reasonable shape and the two MCP entries can coexist in one config. A Cloud-API-wrapping MCP server (HTTP transport) handles outbound to opted-in users; the local desktop server (stdio) reads the personal inbox, drafts replies, and sends one-to-one messages from the personal account. The agent picks based on which account should send. The split is clean because the sending identities are distinct: the Cloud-API number is a verified business number that does not exist in the consumer app, and the desktop number is your personal account that does not exist in Business Manager. There is no overlap to worry about.",
  },
  {
    q: "What is the Cloud API actually charging in May 2026?",
    a: "Meta moved from conversation-based pricing to per-message pricing on November 1, 2025. Marketing templates are billed by destination country and category. Headline ranges from Meta's pricing documentation: marketing templates roughly $0.025 (India) to $0.1365 (Germany) per message, utility templates lower (often near zero in some markets through 2025-2026 promo windows), authentication templates separately priced. Service messages, meaning replies inside the recipient's 24-hour service window, remain free. BSPs add markup on top. Check the current rates at https://developers.facebook.com/docs/whatsapp/pricing before doing capacity math; the numbers move.",
  },
  {
    q: "Is desktop automation against WhatsApp's terms?",
    a: "It uses two sanctioned surfaces: the official WhatsApp desktop app and the macOS Accessibility framework (the same surface VoiceOver uses). What gets accounts banned is the kind of activity, not the mechanism. A personal account using desktop automation to send the messages it would normally send, to people it would normally send them to, is the same as a human typing in the same app. A personal account using any automation, including desktop automation, to mass-message strangers or behave like a business, is the kind of activity that triggers consumer terms enforcement; it is also what the Business API exists for. Read the consumer terms at https://www.whatsapp.com/legal/terms-of-service before pushing volume.",
  },
  {
    q: "What about Linux or Windows? The keyword does not say macOS.",
    a: "Desktop automation as a category exists on every OS. WhatsApp has a desktop app on Windows and a web client that runs on Linux. The macOS-specific accessibility-driven approach this site documents does not port directly because the underlying APIs (AXUIElement on macOS, UI Automation on Windows, AT-SPI on Linux) are different and the WhatsApp Windows app exposes a different accessibility tree. If you are on Windows, the available paths are an open-source library that speaks the multi-device protocol (Baileys, whatsapp-web.js) or commercial WhatsApp-Web automation SaaS. The Cloud API is the same on every OS because it is a Meta-hosted HTTP endpoint; nothing on your side is OS-specific beyond a webhook server.",
  },
  {
    q: "Do I need to pick one? Can the same product use both at once?",
    a: "Plenty of products do both, on purpose. A small example: a consumer-facing service uses the Cloud API to send order updates from a verified business number, and the founder uses the desktop server on their own Mac to reply personally to high-touch inbound from their personal account. Same product, two sending identities, two MCP entries in the same agent config. The decision tree above is about a single message: who is sending, to whom, at what rate. Most products have more than one answer.",
  },
  {
    q: "How does this compare to Baileys or whatsapp-web.js?",
    a: "Those are a third architectural category: open-source clients that speak WhatsApp's multi-device protocol directly (Baileys) or drive whatsapp-web.com via Puppeteer (whatsapp-web.js). They are interesting when you want desktop-style flexibility without macOS-only hardware. The tradeoff is account-level: WhatsApp's anti-automation systems monitor the multi-device protocol and whatsapp-web.com closely, and accounts running these libraries do get banned, especially for outbound that looks bulk. Treat any account you operate this way as disposable. The desktop accessibility path avoids that surface because it drives the official client; the protocol traffic looks identical to a human user's.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "WhatsApp desktop automation vs Cloud API: pick by throughput, not features",
    description:
      "A throughput-first comparison between two architectures for sending WhatsApp messages programmatically. Desktop automation drives the official WhatsApp desktop app via OS accessibility and verifies sends in-band by re-reading the chat; the Cloud API submits HTTP requests to Meta and confirms delivery asynchronously via webhooks. The article reads the actual Thread.sleep timings from handleSendMessage in Sources/WhatsAppMCP/main.swift (1.9 seconds plus two AX tree traversals per verified send) and derives a steady-state ceiling near 15 messages per minute on one Mac. That ceiling, not policy framing, is the decision axis.",
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

export default function WhatsappDesktopVsCloudApiPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen pb-24">
        <div className="max-w-3xl mx-auto px-6 pt-10">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <header className="max-w-3xl mx-auto px-6 mt-8">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
            Architecture comparison, decided by one number
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
            WhatsApp desktop automation vs the Cloud API: pick by throughput, not features.
          </h1>
          <p className="text-lg text-zinc-700 leading-relaxed mb-4">
            Almost every comparison on this topic frames the choice as
            personal account versus verified business, or policy versus
            convenience. That framing skips the only number that actually
            decides architecture: how fast you can send one verified
            message.
          </p>
          <p className="text-lg text-zinc-700 leading-relaxed mb-4">
            Below is the wall-clock math on both sides, read straight from
            real code on the desktop side and from Meta&apos;s own docs on
            the Cloud API side. Once the throughput ceiling is on the
            table, everything else (verification, opt-in, identity, cost)
            falls out as a consequence.
          </p>
        </header>

        <div className="max-w-3xl mx-auto px-6 mt-6">
          <ArticleMeta
            datePublished={PUBLISHED}
            readingTime="10 min read"
            author="Matthew Diakonov"
            authorRole="Written with AI"
          />
        </div>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <GlowCard>
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-3">
                Direct answer, verified 2026-05-13
              </p>
              <p className="text-zinc-900 text-lg leading-relaxed mb-3">
                These are not feature-overlap competitors. They sit at
                opposite ends of one axis: wall-clock throughput.
              </p>
              <ul className="list-disc pl-5 text-zinc-700 leading-relaxed space-y-2">
                <li>
                  <span className="font-semibold text-zinc-900">
                    Desktop automation
                  </span>{" "}
                  if one human (or one agent on behalf of one human)
                  sends conversational messages to known contacts at
                  under roughly 15 per minute, from a personal account
                  on a Mac. Verified in-band by re-reading the chat.
                </li>
                <li>
                  <span className="font-semibold text-zinc-900">
                    The{" "}
                    <a
                      href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                      className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                    >
                      WhatsApp Cloud API
                    </a>
                  </span>{" "}
                  if a verified business sends opted-in templates at any
                  volume, from a registered Business Cloud API number.
                  Verified asynchronously by webhook events.
                </li>
              </ul>
              <p className="text-zinc-700 leading-relaxed mt-4 text-sm">
                The 15 per minute number is the steady-state ceiling
                derived from the actual{" "}
                <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-xs">
                  Thread.sleep
                </code>{" "}
                timings in{" "}
                <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-xs">
                  handleSendMessage
                </code>{" "}
                in{" "}
                <a
                  href="https://github.com/m13v/whatsapp-mcp-macos/blob/main/Sources/WhatsAppMCP/main.swift"
                  className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                >
                  Sources/WhatsAppMCP/main.swift
                </a>
                . The full breakdown is below.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The latency budget on the desktop side, line by line
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Other guides handwave this as &quot;a few seconds per
            message.&quot; The actual budget is open source and easy to
            measure. Four explicit sleeps, two full accessibility-tree
            traversals, and OS-level paste plus keystroke time. Total:
            roughly 3.5 to 5 seconds per send-plus-verify.
          </p>

          <MetricsRow metrics={latencyMetrics} />

          <AnimatedCodeBlock
            code={desktopSendCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift (handleSendMessage, lines 888-957)"
          />

          <p className="text-zinc-700 leading-relaxed mt-6">
            Each sleep exists for a reason. The 0.3 seconds after
            activating WhatsApp lets the window come to the foreground.
            The 0.3 seconds after clicking the compose field gives the
            cursor time to land. The 0.3 seconds after pasting absorbs
            clipboard-handler jitter. The 1.0 second after Return is the
            verification budget: the time the bubble has to actually
            render in the chat list before the second AX traversal walks
            the tree looking for it. Tighten any of those and the success
            rate on real chats drops.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The same operation on the Cloud API side
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            On the Cloud API the send itself is a 300ms HTTP request. The
            interesting part is everything that has to happen around it
            so the call works at all: verified business, registered
            number, approved template, opt-in record, and a webhook to
            receive the events that tell you whether the message
            actually landed.
          </p>

          <AnimatedCodeBlock
            code={cloudApiSendCode}
            language="javascript"
            filename="WhatsApp Cloud API call (TypeScript)"
          />

          <p className="text-zinc-700 leading-relaxed mt-6">
            Two timelines stack here. The HTTP request returns fast (~300ms
            with a message ID). The webhook events arrive later: sent
            usually within a few seconds, delivered when the recipient&apos;s
            device acknowledges, read when the user actually opens the
            chat. None of those events are synchronous with your send.
            Your integration keeps state and reconciles.
          </p>

          <ProofBanner
            metric="~300ms ACK"
            quote='Graph API responds with a message ID. "Sent" / "delivered" / "read" arrive on your webhook later, asynchronously, in the order the recipient device acknowledges. Compare to the desktop path, which answers the same question synchronously by re-reading the chat 1.0 seconds after Return.'
            source="developers.facebook.com/docs/whatsapp/cloud-api, webhooks/components"
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The two send loops, side by side
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Same operation, two architectures. Toggle to see the loop
            each one forces your code into.
          </p>

          <BeforeAfter
            before={{
              label: "Desktop automation (one Mac)",
              content:
                "Strictly serial loop on one machine. Send, sleep, re-read, decide, send next. Throughput is bounded by wall-clock latency.",
              highlights: [
                "send -> sleep 1.0s -> AX traversal -> verify -> next message",
                "~4 seconds per verified send, end-to-end on one box",
                "~15 messages per minute steady state (12-17 in practice)",
                "Synchronous: caller knows verified true/false before returning",
                "Scales horizontally only by adding Macs (one identity each)",
                "Zero webhook infrastructure",
              ],
            }}
            after={{
              label: "Cloud API (Meta-hosted)",
              content:
                "Pipelined fan-out. Submit many requests in parallel, reconcile delivery later by matching webhook events to message IDs.",
              highlights: [
                "POST /messages returns message_id in ~300ms",
                "Webhook delivers sent/delivered/read events asynchronously",
                "Hundreds of requests/sec per phone number; rate-tier ceiling on unique daily users",
                "Asynchronous: integration tracks state across two clocks",
                "Scales vertically inside one phone number (no extra hardware)",
                "Requires a publicly addressable HTTPS webhook",
              ],
            }}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Five questions that decide it
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Walk these in order. The first one that pushes you off
            desktop automation is the answer. If you make it through all
            five and you are still on desktop automation, that is the
            right architecture for what you are doing.
          </p>

          <StepTimeline steps={decisionSteps} />
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 max-w-3xl mx-auto">
            Desktop automation vs Cloud API: the full picture
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl mx-auto">
            Ten rows. The first three are where most other comparisons
            stop. The rest are where the architecture decision actually
            lives.
          </p>
          <ComparisonTable
            heading="Architecture comparison"
            intro="Both columns are real, in-production architectures. Neither replaces the other; they fit different shapes of work."
            productName="Desktop automation (WhatsApp MCP for macOS)"
            competitorName="WhatsApp Cloud API"
            rows={decisionRows}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The honest case for the Cloud API
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Anything past about 15 verified messages per minute, with
            anyone other than yourself doing the sending, lives on the
            Cloud API. Order confirmations to thousands of customers a
            day, OTPs, appointment reminders, shipping updates: all
            template-shaped messages from a verified business to
            opted-in users at fan-out scale. The Cloud API is built for
            that and the desktop path is not.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The Cloud API also wins when the sending identity is
            organizational, not personal. A registered business
            phone number, multiple operators sharing access, audit logs,
            rotation of human agents: all of that is what
            multi-tenant SaaS architectures are for, and that is what
            Business Solution Providers package on top of the Cloud
            API. If your team has a compliance officer who needs to see
            opt-in records, you are not on the desktop path.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The honest case for desktop automation
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Everything under that 15 per minute ceiling, where the
            sender is one human (or one AI agent acting on behalf of
            that human), and the recipients are people the sender
            normally chats with. Solo founders routing inbound. AI
            agents triaging your inbox while you sleep. Long-tail
            personal coordination that should not flow through a
            verified business number.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The architectural pull here is not feature parity, it is
            removed surface area. No webhook server. No template
            review. No opt-in spreadsheet. No second phone number. No
            BSP relationship. Your agent reads from and writes to the
            same WhatsApp app you already use, with synchronous
            confirmation that the bubble appeared, and the only
            operational concern is the macOS Accessibility permission
            being granted to the right binary.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            For the case the desktop path covers, it is the simplest
            architecture available. For the case it does not cover, no
            amount of optimization makes it the right tool.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            They coexist in the same agent config
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Nothing forces a single architecture per product. A common
            shape: one stdio MCP entry pointing at the local desktop
            server for personal-account work, one HTTP MCP entry
            wrapping the Cloud API for verified-business work, and the
            agent picks based on which account should send. The two
            paths target distinct sending identities (a personal number
            and a Cloud API number, which cannot be the same number at
            the same time), so they do not step on each other.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            See the{" "}
            <a
              href="https://github.com/m13v/whatsapp-mcp-macos"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              whatsapp-mcp-macos
            </a>{" "}
            README for the stdio entry. See{" "}
            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              Meta&apos;s Cloud API getting-started guide
            </a>{" "}
            for the verified-business onboarding.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Not sure which side of the 15-per-minute line you are on?"
          description="If you have a specific use case and the architecture choice is not obvious, book 30 minutes. Faster than reading another comparison."
        />

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <FaqSection items={faqItems} />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Map your use case to desktop automation vs Cloud API in 30 min."
        />
      </article>
    </>
  );
}
