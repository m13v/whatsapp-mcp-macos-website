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
  AnimatedChecklist,
  AnimatedBeam,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/alternative/self-hosted-whatsapp-gateway-vs-accessibility-apis";
const PUBLISHED = "2026-05-15";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "Self-hosted WhatsApp gateway vs accessibility APIs: pick by detection surface",
  description:
    "Baileys, Evolution API, whatsapp-web.js, and wppconnect all speak WhatsApp's multi-device protocol (or scrape the web client). That is the exact traffic Meta fingerprints. Accessibility APIs drive the official desktop app through macOS Accessibility and never touch that surface. Same job, opposite sides of the ban risk.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Self-hosted WhatsApp gateway vs accessibility APIs: pick by detection surface",
    description:
      "Self-hosted gateways speak the WhatsApp protocol. Accessibility APIs drive the official client and never touch the protocol. Decide which side of Meta's detection surface you want to live on.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Self-hosted WhatsApp gateway vs accessibility APIs",
    description:
      "Baileys speaks WhatsApp's protocol. Accessibility APIs drive the official client. Two architectures, two sides of Meta's detection surface.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Alternatives", href: "/alternative" },
  { label: "Self-hosted gateway vs accessibility APIs" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  {
    name: "Alternatives",
    url: "https://whatsapp-mcp-macos.com/alternative",
  },
  { name: "Self-hosted gateway vs accessibility APIs", url: PAGE_URL },
];

const baileysSend = `// Baileys send. Real network traffic to WhatsApp servers.
// Your process holds a Noise-encrypted socket to mmg.whatsapp.net
// pretending to be a linked device. Meta sees the socket.

import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys"

const { state, saveCreds } = await useMultiFileAuthState("./auth")
const sock = makeWASocket({ auth: state })

sock.ev.on("creds.update", saveCreds)
sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
  // 401 / 403 disconnects here are Meta saying "we noticed."
  // baileys-antiban exists for a reason.
})

// One outbound. Goes over the multi-device protocol socket.
await sock.sendMessage("15551234567@s.whatsapp.net", {
  text: "hello",
})
// Account state lives on Meta's side. If their model flags this
// session as automation, the next connection.update is a logout.`;

const accessibilitySend = `// WhatsApp MCP send. No socket to WhatsApp servers from this process.
// The only network traffic is whatever the WhatsApp app itself makes,
// which is identical to your normal human session.

// Sources/WhatsAppMCP/main.swift, handleSendMessage (excerpt)
func handleSendMessage(args: [String: Value]?) throws -> String {
    let message = try getRequiredString(from: args, key: "message")
    let pid = try ensureWhatsAppRunning()
    activateWhatsApp(pid: pid)
    Thread.sleep(forTimeInterval: 0.3)

    let elements = traverseAXTree(pid: pid)          // read screen
    let textAreas = findElements(in: elements, role: "AXTextArea")
    let compose = textAreas.first { /* compose / message / type */ }

    clickElement(compose!)                            // OS click
    Thread.sleep(forTimeInterval: 0.3)
    _ = pasteText(message)                            // OS clipboard
    Thread.sleep(forTimeInterval: 0.3)
    pressReturn()                                     // OS keystroke
    Thread.sleep(forTimeInterval: 1.0)

    // Verify by re-reading the screen, not by waiting for a webhook.
    let postElements = traverseAXTree(pid: pid)
    let generics = findElements(in: postElements, role: "AXGenericElement")
    let lastSent = generics.first {
        $0.description?.hasPrefix("Your message, ") == true
    }
    // ...
}`;

const surfaceRows = [
  {
    feature: "Where the protocol lives",
    competitor:
      "In your process. Baileys speaks WhatsApp's multi-device protocol directly. Evolution API and wppconnect wrap Baileys. whatsapp-web.js and wppconnect-puppeteer drive an automated headless WhatsApp Web tab.",
    ours:
      "In the WhatsApp app, untouched. The accessibility-API process never opens a socket to mmg.whatsapp.net, graph.facebook.com, or web.whatsapp.com. It only reads and writes the screen.",
  },
  {
    feature: "What Meta sees from the sending account",
    competitor:
      "A linked-device session with traffic patterns their ML can score: message cadence, reply ratio, contact graph distance, time-of-day distribution, identical-content fan-out. Confirmed ban vector per WhatsMeow / Baileys issue threads (e.g. WhiskeySockets/Baileys#1869).",
    ours:
      "A single regular desktop session, the one a human already uses. Sends look like a human pasting from the clipboard, because that is literally what happens.",
  },
  {
    feature: "How a send is verified",
    competitor:
      "Async ack from the protocol layer (Baileys' messages.update event with key.id and status). Your code keeps state and reconciles.",
    ours:
      "Synchronous, by re-reading the chat. After Return, the server walks the accessibility tree and looks for an AXGenericElement whose description begins with the literal prefix \"Your message, \". Match means the bubble rendered.",
  },
  {
    feature: "Where it runs",
    competitor:
      "Anywhere Node.js or Docker runs. Linux server, container, edge. That portability is the whole point.",
    ours:
      "Only macOS. Depends on AXUIElement, kAXChildrenAttribute, and the WhatsApp Catalyst app's specific accessibility tree.",
  },
  {
    feature: "Sending identity",
    competitor:
      "A linked device on whichever WhatsApp account scanned the QR. Same legal identity as the primary phone.",
    ours:
      "Whatever account is signed in to the Mac's WhatsApp app. Usually the operator's personal account, used exactly as they already use it.",
  },
  {
    feature: "Throughput per sending unit",
    competitor:
      "Hundreds of messages per minute on paper. Practical sustained throughput is whatever survives the ban-risk model; community guidance lands around tens per minute with anti-ban middleware, lower without.",
    ours:
      "About 15 messages per minute on one Mac. Bounded by ~3-5 seconds of real wall-clock per send-plus-verify; strictly serial because the WhatsApp window is a singleton UI you are typing into.",
  },
  {
    feature: "Account-ban risk profile",
    competitor:
      "Non-trivial and documented. Bans range from temporary 24h to permanent within hours of first session, especially for new numbers or messaging strangers. Anti-ban tooling exists (kobie3717/baileys-antiban, warm-up systems) precisely because the bare protocol path is risky.",
    ours:
      "Low at human-equivalent volume. The detection surface Meta uses for linked-device automation does not see this path. Activity-level patterns (mass-messaging strangers, robotic timing) still apply to any account no matter how the messages are sent.",
  },
  {
    feature: "Webhook / public infra",
    competitor:
      "Webhook server typical for inbound. Many SaaS gateways (Evolution API) want a publicly reachable HTTPS endpoint for events.",
    ours:
      "None. stdio child of your MCP host. No inbound network surface.",
  },
  {
    feature: "Open source",
    competitor:
      "Baileys (MIT-style), whatsapp-web.js (Apache 2.0), Evolution API (Apache 2.0), wppconnect (LGPL).",
    ours:
      "MIT-licensed npm package. github.com/m13v/whatsapp-mcp-macos.",
  },
  {
    feature: "Honest fit",
    competitor:
      "Disposable / business-grade WhatsApp numbers where ban risk is acceptable, multi-tenant SaaS, Linux deployments, and high-throughput outbound when paired with anti-ban middleware.",
    ours:
      "One human, or one AI agent on behalf of one human, on a Mac, sending the messages they would normally send. Solo founders, MCP agents, inbox triage, personal-account automation.",
  },
];

const detectionChecklist = [
  { text: "Protocol socket from your process to WhatsApp servers" },
  { text: "Linked-device handshake under your code's control" },
  { text: "Web client driven by Puppeteer / Playwright" },
  { text: "Long-running headless browser sessions" },
  { text: "JID / multi-device pairing state stored locally" },
  { text: "messages.update events you have to reconcile" },
];

const offSurfaceChecklist = [
  { text: "WhatsApp Desktop app from the App Store, untouched" },
  { text: "macOS Accessibility framework (the one VoiceOver uses)" },
  { text: "AX tree reads at max depth 15" },
  { text: "OS-level clicks, clipboard paste, Return keystroke" },
  { text: "Send verified by finding \"Your message, ...\" in the chat" },
  { text: "No socket to graph.facebook.com or web.whatsapp.com" },
];

const faqItems = [
  {
    q: "Why is the multi-device protocol the part that gets accounts banned?",
    a: "Because that is where Meta has end-to-end observability into your code's behavior. When Baileys, whatsmeow, or any other library opens a Noise-encrypted socket to mmg.whatsapp.net and claims to be a linked device, every send, every read receipt, every typing indicator, every contact sync travels through that socket. Meta's anti-automation models score that traffic on cadence, reply ratio, identical-content fan-out, time-of-day distribution, and contact-graph distance. Multiple open issue threads on Baileys (issues/1869, issues/2309) and on whatsmeow (issue/810) document bans landing within hours of scanning a QR, especially on new numbers or accounts that immediately message strangers. The fix the community converged on is anti-ban middleware that emulates human cadence (kobie3717/baileys-antiban). That entire detection model does not apply to the accessibility-API path, because no socket leaves your process. The WhatsApp app itself opens the only socket, and that socket carries one human user's normal traffic.",
  },
  {
    q: "What exactly does the accessibility API path expose to WhatsApp?",
    a: "Nothing that did not already exist before you installed it. The flow: AXUIElementCreateApplication grabs a handle to the running WhatsApp app. AXUIElementCopyAttributeValue reads kAXRoleAttribute, kAXDescriptionAttribute, kAXValueAttribute, kAXTitleAttribute, kAXPositionAttribute, kAXSizeAttribute, kAXChildrenAttribute from each element. The traversal walks to a max depth of 15. That is the same data macOS exposes to VoiceOver so a blind user can navigate the same app. It is a local in-process call to the macOS Accessibility framework. There is no IPC to Meta, no protocol packet, no remote attestation hook the WhatsApp app could use to detect that it is being read. When the server pastes text and presses Return, it does so via CGEvent (the same path keyboard shortcuts take) and Cmd+V (the OS clipboard). The WhatsApp app receives a keystroke, formats it as a normal outgoing message, and sends it through its own protocol the way it always does.",
  },
  {
    q: "If accessibility APIs are safer, why do most teams pick Baileys or Evolution API?",
    a: "Two real reasons. First, portability: Baileys runs on a $5 Linux box, Evolution API runs in Docker, both run on infrastructure teams already operate. The accessibility path needs a Mac, which is an awkward production deployment. Second, throughput: a Baileys session can in principle push hundreds of messages per minute through the protocol; the accessibility path is hard-capped near 15 per minute per Mac because it is driving one focused UI. For multi-tenant SaaS sending opted-in transactional or marketing messages, neither limit fits and the right answer is Meta's official Cloud API. For personal-account automation, solo-founder inbound routing, or an AI agent triaging your own messages, Mac plus accessibility wins on the only axis that matters there: not getting your number banned. Pick by your actual constraint, not by which option is more famous.",
  },
  {
    q: "Where is the AX-tree traversal that does all the reading?",
    a: "Sources/WhatsAppMCP/main.swift in the open repo at github.com/m13v/whatsapp-mcp-macos. The traverseAXTree function (around lines 118-176) creates an AXUIElement for the WhatsApp process, sets a 5-second messaging timeout, and recursively walks children up to depth 15. For every element it captures role, description, value, title, and CGRect (position + size). Roles it explicitly keeps even without text are AXButton, AXTextField, AXTextArea, AXStaticText, AXHeading, AXGenericElement, AXLink. The send-side code (handleSendMessage, around lines 888-958) runs this traversal twice per outbound: once to find the compose AXTextArea, once to verify a 'Your message, ' bubble appeared after Return. Both traversals are local; nothing leaves the machine.",
  },
  {
    q: "Can I run Baileys safely if I just use anti-ban middleware?",
    a: "Better than running it without, but the model is still adversarial. Anti-ban middleware (e.g. kobie3717/baileys-antiban) emulates human cadence, rate-limits sends, ramps new numbers across days, and pauses when health checks see 403s. It moves the median session lifetime from hours to weeks for accounts doing reasonable volume. It does not change the underlying truth that Meta's ML is scoring your socket. Treat a Baileys account as disposable: design for the case where it gets logged out, plan a re-pair path, and never put your personal number on it. The accessibility path is a different choice with different tradeoffs: you keep your personal number safe but accept macOS hardware and the 15/min ceiling.",
  },
  {
    q: "What about wuzapi, wppconnect, green-api, and the rest? Do they have a different risk profile?",
    a: "Not really, at the protocol level. wuzapi and wppconnect-server wrap whatsmeow and Baileys respectively, so they inherit the same detection surface. green-api hosts the connection on their infrastructure (sometimes a Cloud API-flavored offering, sometimes Baileys-flavored behind their REST), so the risk depends on which side they actually use; their unofficial tier is fundamentally the same as self-hosting Baileys. whatsapp-web.js and venom-bot drive automated whatsapp-web.com via Puppeteer, which is a different surface but one Meta also monitors closely. The honest grouping: any gateway whose architecture is 'open a session pretending to be a real client' lives on the same detection surface, regardless of which library is under it.",
  },
  {
    q: "Can the accessibility path and a self-hosted gateway coexist in one product?",
    a: "Yes, and it is a common shape. One MCP entry pointing at the local accessibility-driven server on the Mac handles personal-account work: drafting replies, reading group chats, inbox triage. A second MCP entry (HTTP) wrapping Evolution API or Baileys on a Linux box handles disposable-account outbound where ban risk is acceptable. The agent picks based on which account should send. The two paths target different sending identities and different volume profiles, so they do not step on each other. If you want a third lane for verified-business sending, plug Meta's Cloud API in as a third MCP entry; see the /alternative/whatsapp-desktop-vs-cloud-api page on this site for that comparison.",
  },
  {
    q: "Does WhatsApp actually allow accessibility automation in their terms?",
    a: "The mechanism is not the policy lever. The Accessibility framework on macOS is the same surface VoiceOver uses; using it to read and write the WhatsApp window is no different from a screen reader user navigating the app. What WhatsApp's consumer terms care about is the activity: a personal account having normal conversations with normal contacts is sanctioned no matter how the typing happens; a personal account mass-messaging strangers or behaving like a business is the kind of activity that triggers enforcement no matter how the typing happens. The Business API exists for business-shaped use cases. Read the consumer terms at https://www.whatsapp.com/legal/terms-of-service before pushing volume on any path.",
  },
  {
    q: "What is the smallest example of the accessibility path actually working?",
    a: "Install: npm install -g whatsapp-mcp-macos. Grant Accessibility permission to the binary in System Settings > Privacy & Security > Accessibility. Add a stdio entry to your MCP host (Claude Desktop, Cursor, Windsurf) pointing at the installed binary. Restart the host. Then in your agent: whatsapp_start, whatsapp_search('matt'), whatsapp_open_chat({index: 0}), whatsapp_send_message('hello'). The send returns synchronously with verified:true once the bubble appears. Total wall-clock from install to first verified send is usually under five minutes; the only step that takes user judgment is the Accessibility permission grant.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "Self-hosted WhatsApp gateway vs accessibility APIs: pick by detection surface",
    description:
      "An architecture-first comparison between two paths for driving WhatsApp programmatically without Meta's Cloud API. Self-hosted gateways (Baileys, Evolution API, whatsapp-web.js, wppconnect) speak WhatsApp's multi-device protocol or scrape the web client, putting your account on Meta's detection surface. Accessibility APIs (WhatsApp MCP on macOS) drive the official desktop client through the macOS Accessibility framework and never open a socket to WhatsApp servers. The article reads the actual traversal code from Sources/WhatsAppMCP/main.swift (max depth 15, looking for an AXGenericElement whose description starts with 'Your message, ') and contrasts it with Baileys' multi-device socket model.",
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

export default function SelfHostedGatewayVsAccessibilityApisPage() {
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
            Two architectures, opposite sides of the detection surface
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
            Self-hosted WhatsApp gateway vs accessibility APIs: pick by detection surface.
          </h1>
          <p className="text-lg text-zinc-700 leading-relaxed mb-4">
            Every comparison on this topic starts and stops at &quot;your
            account may get banned.&quot; The interesting question is{" "}
            <em>why</em>, and the answer is structural: self-hosted gateways
            and accessibility APIs sit on opposite sides of the surface
            Meta uses to detect automation.
          </p>
          <p className="text-lg text-zinc-700 leading-relaxed mb-4">
            Below is what each path actually does at the network layer,
            with code from both sides, and the tradeoffs that fall out
            once you stop framing it as &quot;safe vs unsafe&quot; and
            start framing it as &quot;which protocol surface does my
            process touch.&quot;
          </p>
        </header>

        <div className="max-w-3xl mx-auto px-6 mt-6">
          <ArticleMeta
            datePublished={PUBLISHED}
            readingTime="9 min read"
            author="Matthew Diakonov"
            authorRole="Written with AI"
          />
        </div>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <GlowCard>
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-3">
                Direct answer, verified 2026-05-15
              </p>
              <p className="text-zinc-900 text-lg leading-relaxed mb-3">
                Same goal, opposite architectures. One puts your code
                on the WhatsApp protocol; the other keeps it off the
                protocol entirely and works through the OS instead.
              </p>
              <ul className="list-disc pl-5 text-zinc-700 leading-relaxed space-y-2">
                <li>
                  <span className="font-semibold text-zinc-900">
                    Self-hosted gateway
                  </span>{" "}
                  (
                  <a
                    href="https://github.com/WhiskeySockets/Baileys"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                  >
                    Baileys
                  </a>
                  ,{" "}
                  <a
                    href="https://github.com/EvolutionAPI/evolution-api"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                  >
                    Evolution API
                  </a>
                  ,{" "}
                  <a
                    href="https://github.com/pedroslopez/whatsapp-web.js"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                  >
                    whatsapp-web.js
                  </a>
                  ,{" "}
                  <a
                    href="https://github.com/wppconnect-team/wppconnect"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                  >
                    wppconnect
                  </a>
                  ) speaks WhatsApp&apos;s multi-device protocol or
                  drives an automated WhatsApp Web tab. Runs anywhere,
                  throughputs hundreds per minute on paper, lives on
                  Meta&apos;s detection surface, ban risk is real.
                </li>
                <li>
                  <span className="font-semibold text-zinc-900">
                    Accessibility APIs
                  </span>{" "}
                  (
                  <a
                    href="https://github.com/m13v/whatsapp-mcp-macos"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                  >
                    WhatsApp MCP for macOS
                  </a>
                  ) drive the official desktop app through the macOS
                  Accessibility framework. macOS only, capped near 15
                  messages per minute per Mac, stays off the protocol
                  detection surface entirely because no socket leaves
                  your process.
                </li>
              </ul>
              <p className="text-zinc-700 leading-relaxed mt-4 text-sm">
                Pick the gateway if you have disposable numbers, need
                Linux portability, or are sending business-shaped
                volume you accept ban risk on. Pick the accessibility
                path if the account that sends is the one you also use
                personally and you would prefer not to have it banned.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 max-w-3xl mx-auto">
            Where each architecture actually touches WhatsApp
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-8 max-w-3xl mx-auto">
            Same outcome (a message reaches a recipient) but the
            sockets land in totally different places. This is the
            picture that decides everything else.
          </p>

          <AnimatedBeam
            title="Two protocol topologies"
            hub={{ label: "WhatsApp servers", sublabel: "mmg.whatsapp.net, web.whatsapp.com" }}
            from={[
              { label: "Your Baileys process", sublabel: "multi-device socket from your box" },
              { label: "whatsapp-web.js", sublabel: "headless Chrome tab on your box" },
              { label: "Evolution API", sublabel: "Baileys wrapped in REST" },
            ]}
            to={[
              { label: "WhatsApp Desktop app", sublabel: "official client on the Mac" },
              { label: "WhatsApp MCP server", sublabel: "reads/writes the app via macOS AX, no socket" },
              { label: "Your MCP host", sublabel: "Claude, Cursor, Windsurf via stdio" },
            ]}
          />

          <p className="text-zinc-600 leading-relaxed text-sm mt-6 max-w-3xl mx-auto">
            Left side: each box owns a socket talking to WhatsApp
            servers. That socket is what Meta&apos;s anti-automation
            models score. Right side: the WhatsApp Desktop app owns
            the only socket on the box, exactly as it does for a
            normal user; the MCP server only touches the app, not the
            network.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            One outbound message, in code, on both sides
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Read the two paths side by side. On the left, your process
            opens a Noise-encrypted socket to Meta and claims to be a
            linked device. On the right, your process opens nothing;
            it walks the running app&apos;s accessibility tree, types
            into the compose field, and re-reads the chat to verify.
          </p>

          <AnimatedCodeBlock
            code={baileysSend}
            language="typescript"
            filename="Baileys self-hosted gateway (TypeScript)"
          />

          <div className="mt-6">
            <AnimatedCodeBlock
              code={accessibilitySend}
              language="swift"
              filename="WhatsApp MCP, Sources/WhatsAppMCP/main.swift (excerpt)"
            />
          </div>

          <p className="text-zinc-700 leading-relaxed mt-6">
            The asymmetry is not stylistic. The left process is a
            WhatsApp client. The right process is not a WhatsApp
            client. It is a macOS user-input automation script that
            happens to be aimed at WhatsApp&apos;s window.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What lives on the detection surface
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Meta&apos;s anti-automation models do not look at your
            laptop. They look at whatever is at the other end of a
            socket claiming to be a WhatsApp client. Anything on this
            list is visible to that model.
          </p>

          <AnimatedChecklist
            title="Self-hosted gateway path"
            items={detectionChecklist}
          />

          <p className="text-zinc-700 leading-relaxed mt-6">
            Each item is something Meta&apos;s linked-device telemetry
            can see. The community-maintained{" "}
            <a
              href="https://github.com/kobie3717/baileys-antiban"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              baileys-antiban
            </a>{" "}
            middleware exists precisely to muddy these signals (human
            cadence, warm-up ramps, 403 detection). It pushes median
            session lifetime up but does not change what surface the
            traffic is on.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What stays off the detection surface
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            The accessibility-API path uses no item from the list
            above. The list it uses instead is below. Everything here
            is local to your Mac.
          </p>

          <AnimatedChecklist
            title="Accessibility-API path"
            items={offSurfaceChecklist}
          />

          <p className="text-zinc-700 leading-relaxed mt-6">
            The WhatsApp app still opens its own socket to WhatsApp
            servers, of course; it has to in order for a message to
            actually reach a recipient. But that socket is the one a
            normal human session opens. The MCP server does not own
            it, does not pretend to be a client, and is invisible to
            anything Meta does on the protocol layer.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <ProofBanner
            metric='AXGenericElement starts with "Your message, "'
            quote="Send verification on the accessibility path is just reading the screen the way VoiceOver does. After Return, the server walks the AX tree, finds the bubble whose accessibility description begins with that literal prefix, and matches it against what was typed. No webhook, no protocol ack, no socket."
            source="Sources/WhatsAppMCP/main.swift, handleSendMessage"
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 max-w-3xl mx-auto">
            The full picture: surface, identity, throughput, fit
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl mx-auto">
            Ten rows. The first three are where the architectural
            decision actually lives. The rest are the consequences.
          </p>
          <ComparisonTable
            heading="Architecture comparison"
            intro="Both columns are real, in-production architectures. Neither replaces the other; they fit different shapes of work and accept different risks."
            productName="Accessibility APIs (WhatsApp MCP for macOS)"
            competitorName="Self-hosted gateway (Baileys, Evolution API, whatsapp-web.js, wppconnect)"
            rows={surfaceRows}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The honest case for a self-hosted gateway
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Anywhere you need Linux portability, Docker, or a
            stateless container, the accessibility path is just not
            available. Anywhere the sending account is disposable (a
            burner number you bought specifically to run automation
            on), the ban risk is priced in and Baileys-class
            throughput is the right shape. Anywhere you are sending
            transactional or bulk-shaped messages where business
            verification is not realistic and you accept the
            cat-and-mouse with Meta&apos;s detection model, the
            gateway path wins on every other axis.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Treat the account on a gateway as disposable. Design for
            the case where it logs out, plan a re-pair path, and never
            run it on your personal number.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The honest case for the accessibility-API path
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            One human (or one AI agent on behalf of one human),
            sending conversational messages to known contacts, under
            roughly 15 per minute, from a Mac that has WhatsApp
            Desktop signed in to a personal account. That is the
            shape. Solo founders routing inbound from their personal
            WhatsApp. AI agents triaging your inbox overnight.
            Personal-account automations you would not put on Baileys
            because the number matters too much.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The architectural pull here is not feature parity; it is
            removed surface. No QR re-pair flow. No anti-ban
            middleware. No 403 recovery. No webhook server. No second
            phone number you have to keep alive. Your agent reads from
            and writes to the same WhatsApp app you already use, with
            synchronous confirmation that the bubble appeared, and the
            only operational concern is the macOS Accessibility
            permission being granted to the right binary.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            They coexist in the same agent config
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Nothing forces a single architecture per product. A common
            shape: one stdio MCP entry pointing at the local
            accessibility-driven server for personal-account work, one
            HTTP MCP entry wrapping a self-hosted gateway (Evolution
            API in Docker, say) for disposable-account outbound, and
            if you need a third lane, plug Meta&apos;s Cloud API in for
            verified-business templates. The agent picks per send
            based on which account should send.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            For the third lane, the throughput math is at{" "}
            <a
              href="/alternative/whatsapp-desktop-vs-cloud-api"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              desktop automation vs Cloud API
            </a>
            . For the install side of the accessibility path, the
            walkthrough is at{" "}
            <a
              href="/install"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              the install page
            </a>
            .
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Stuck between burner-Baileys and a Mac?"
          description="If you have a specific use case and the architecture choice is not obvious, book 30 minutes. We will work through which side of the detection surface your account belongs on."
        />

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <FaqSection items={faqItems} />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Map your WhatsApp automation to the right architecture in 30 min."
        />
      </article>
    </>
  );
}
