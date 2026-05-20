import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  GradientText,
  BackgroundGrid,
  ShineBorder,
  ShimmerButton,
  AnimatedCodeBlock,
  SequenceDiagram,
  ComparisonTable,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/whatsapp-ai-agent-transport";
const PUBLISHED = "2026-05-20";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";
const GITHUB = "https://github.com/m13v/whatsapp-mcp-macos";
const MAIN_SWIFT =
  "https://github.com/m13v/whatsapp-mcp-macos/blob/main/Sources/WhatsAppMCP/main.swift";
const MCP_TRANSPORTS_SPEC =
  "https://modelcontextprotocol.io/specification/2025-11-25/basic/transports";

export const metadata: Metadata = {
  title:
    "WhatsApp AI agent transport: it's actually two transports, not one",
  description:
    "Wiring an AI agent to WhatsApp means picking TWO transports stacked: stdio JSON-RPC between the agent and the MCP server, then a WhatsApp-side transport (Meta Cloud HTTPS, whatsmeow WebSocket, browser CDP, or macOS accessibility). The second one is where the real architectural choice lives.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "WhatsApp AI agent transport: it's two transports, not one",
    description:
      "Every WhatsApp MCP picks an agent-side transport (stdio) and a WhatsApp-side transport (Business Cloud API, whatsmeow, headless Web, or macOS accessibility). The second one is the actual decision.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp AI agent transport, two layers stacked",
    description:
      "The transport conversation for WhatsApp agents skips the second transport. That's the one that decides whether your account gets banned.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "WhatsApp AI agent transport" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "WhatsApp AI agent transport", url: PAGE_URL },
];

const stdioTransportCode = `// Sources/WhatsAppMCP/main.swift, lines 1190 to 1193
// The literal line that wires the agent-side transport.

let transport = StdioTransport()
fputs("log: setupAndStartServer: starting server...\\n", stderr)
try await server.start(transport: transport)
fputs("log: setupAndStartServer: server started.\\n", stderr)`;

const axTransportCode = `// Sources/WhatsAppMCP/main.swift, lines 484 to 510
// The WhatsApp-side transport. There is no JSON, no socket,
// no Meta endpoint. Just a walk of the on-screen accessibility
// tree, looking for a bubble whose description literally starts
// with "Your message, ".

let elements = traverseAXTree(pid: pid)
let genericElements = findElements(in: elements, role: "AXGenericElement")

var lastSentMessage: String? = nil
for el in genericElements {
    let desc = cleanUnicode(el.description ?? "")
    if desc.hasPrefix("Your message, ") {
        // "Your message, hello there, 12:04 PM"
        // becomes "hello there" after the timestamp suffix
        // and trailing comma are stripped.
        let rest = String(desc.dropFirst("Your message, ".count))
        // ...regex strip the ", 12:04 PM" suffix...
        lastSentMessage = rest
    }
}`;

const transportActors = [
  "Agent (Claude, Cursor)",
  "MCP host",
  "MCP server",
  "WhatsApp",
];

const transportMessages = [
  {
    from: 0,
    to: 1,
    label: "tool_call: send_message(to, body)",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "stdio (JSON-RPC, stdin/stdout)",
    type: "request" as const,
  },
  {
    from: 2,
    to: 3,
    label: "WhatsApp-side transport (choose one of four)",
    type: "request" as const,
  },
  {
    from: 3,
    to: 2,
    label: "AX bubble: 'Your message, ...' / HTTP 200 / WS ack",
    type: "response" as const,
  },
  {
    from: 2,
    to: 1,
    label: "stdio (JSON-RPC, stdout)",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "tool_result: { success: true, verified: true }",
    type: "response" as const,
  },
];

const whatsappTransportRows = [
  {
    feature: "Business Cloud API",
    competitor:
      "HTTPS to graph.facebook.com. Bearer token + phone number id + webhook URL held by the MCP server. Examples: Infobip MCP, Zapier WhatsApp Business Messaging.",
    ours:
      "Honest about pricing per conversation, 24-hour customer-care window, and template approval. Wrong shape for a personal account or a freeform inbound triage.",
  },
  {
    feature: "whatsmeow / web-multidevice",
    competitor:
      "WebSocket to mmg.whatsapp.net using the reverse-engineered web-multidevice protocol. QR scan inside the MCP, session lives in the MCP. Examples: lharries/whatsapp-mcp.",
    ours:
      "No Meta dashboard. Personal reach. The MCP becomes the linked device, so the MCP process holds your account credentials, and bridge crashes can cost the slot.",
  },
  {
    feature: "Headless WhatsApp Web (Puppeteer/Playwright)",
    competitor:
      "Chrome DevTools Protocol to a Chromium that has navigated to web.whatsapp.com. Examples: fyimail/whatsapp-mcp2 and most openwa-derived MCPs.",
    ours:
      "Still a linked-device slot, plus the fragility of Meta's private webpack modules. Selectors and module hooks break every WhatsApp Web reship.",
  },
  {
    feature: "macOS accessibility (this server)",
    competitor:
      "AXUIElement + CGEvent against the running WhatsApp Catalyst app, bound by bundle id net.whatsapp.WhatsApp. Source: github.com/m13v/whatsapp-mcp-macos.",
    ours:
      "Zero credentials at the MCP layer. Auth is whoever WhatsApp Desktop is signed in as. Zero linked-device slots consumed. macOS only, desktop app must be running.",
  },
];

const faqItems = [
  {
    q: "What does 'transport' mean for a WhatsApp AI agent?",
    a: "Two different things, stacked. The first is the MCP transport: the channel the AI host (Claude Code, Cursor, Windsurf) uses to talk to the MCP server, almost always stdio JSON-RPC over a child process's stdin/stdout. The MCP spec at modelcontextprotocol.io defines stdio and Streamable HTTP as the two standard options, plus SSE as a legacy option. The second is the WhatsApp-side transport: the channel the MCP server uses to actually reach WhatsApp. That's the one with real consequences (account bans, linked-device slots, OS-only constraints), and it's the one the existing playbooks skim past.",
  },
  {
    q: "Why is stdio always the first transport choice?",
    a: "Because the MCP server is a local child process and stdio is the only channel that needs no port, no TLS, no firewall hole, and no CORS dance. The MCP host forks the binary in your config, writes JSON-RPC to its stdin, reads JSON-RPC from its stdout. The whatsapp-mcp-macos server ships exactly this: line 1191 of Sources/WhatsAppMCP/main.swift is the literal `let transport = StdioTransport()` from the official swift-sdk. If you ever wire an MCP up to a Cloudflare Worker or run it as a remote service, Streamable HTTP becomes the right choice on the agent side, but stdio is the default for a reason.",
  },
  {
    q: "What are the four WhatsApp-side transports?",
    a: "Meta Cloud API (HTTPS to graph.facebook.com), whatsmeow / web-multidevice (a reverse-engineered WebSocket to mmg.whatsapp.net), headless WhatsApp Web (Chrome DevTools Protocol to a Chromium running web.whatsapp.com), and macOS accessibility (AXUIElement + CGEvent against the running WhatsApp Desktop app). Each one trades three things differently: who holds the auth (you, the MCP server, the desktop app), who pays for misbehavior (your phone number, your linked-device slot, your Meta tenant), and what platforms it runs on (anywhere with HTTPS, any server with the bridge, anywhere with Chromium, macOS only).",
  },
  {
    q: "Why does the WhatsApp-side transport matter more than the agent-side?",
    a: "Because stdio vs Streamable HTTP is a deployment topology decision. The WhatsApp-side transport is a relationship-with-Meta decision. If your MCP server holds a Bearer token, you have a Meta tenant. If it holds a whatsmeow session file, the MCP process IS your linked device. If it drives Chromium, you're paired as a web client and you depend on Meta's private webpack modules staying named. If it walks the accessibility tree of a desktop app, you don't appear to Meta as anything new at all. The agent-side transport never has these properties.",
  },
  {
    q: "Does the macOS accessibility path actually count as a transport?",
    a: "Yes. A transport is whatever moves the request from the MCP server to the system that fulfills it. For Business API that's HTTPS frames over TCP. For whatsmeow that's a Noise-handshake WebSocket. For headless Web that's CDP commands over a WebSocket to a Chromium. For accessibility, the transport is a re-walk of the AXUIElement tree plus posted CGEvents for clicks and keystrokes. The server posts paste-and-Return, then re-traverses the tree looking for an AXGenericElement whose description starts with `\"Your message, \"`. That second walk is the verify-and-return path. main.swift line 484 onwards.",
  },
  {
    q: "Can the same MCP server use multiple WhatsApp-side transports?",
    a: "In theory yes, in practice almost no one does. Mixing Business API and a personal session in one MCP would mean two different auth surfaces and two different rate-limit regimes inside one binary. The clearer pattern is one MCP per WhatsApp-side transport, registered separately in your MCP host config under different names (e.g. `whatsapp_personal` and `whatsapp_business`). The agent then picks the right tool by name.",
  },
  {
    q: "What's the smallest test that proves the dual-transport claim?",
    a: "Run any MCP host with whatsapp-mcp-macos installed, then in another terminal run `lsof -p <mcp_pid>` after the server starts. You will see exactly one networking surface: nothing. The MCP holds no sockets, no TLS sessions, no Bearer tokens. The only file descriptors are stdin/stdout (the agent-side transport), the WhatsApp app via the accessibility framework, and a logfile. Compare that to a Business API MCP, which will hold an HTTPS connection to graph.facebook.com, or a whatsmeow MCP, which will hold a WebSocket to mmg.whatsapp.net. The shape of `lsof` is the dual-transport story made visible.",
  },
];

const relatedPosts = [
  {
    title: "WhatsApp MCP server: the four real implementations",
    href: "/t/whatsapp-mcp-server",
    excerpt:
      "Side-by-side breakdown of the four mechanisms behind every WhatsApp MCP, with the failure mode each one hides.",
    tag: "Guide",
  },
  {
    title: "openwa and WhatsApp Web protocol fragility",
    href: "/t/openwa-whatsapp-web-protocol-fragility",
    excerpt:
      "What goes wrong when the WhatsApp-side transport is a script injected into Meta's private webpack modules.",
    tag: "Deep dive",
  },
  {
    title: "WhatsApp automation without the web protocol",
    href: "/t/whatsapp-automation-without-web-protocol",
    excerpt:
      "Why the desktop-accessibility path avoids the WebSocket protocol and the headless-browser approach entirely.",
    tag: "Guide",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "WhatsApp AI agent transport: it's actually two transports, not one",
    description:
      "Wiring an AI agent to WhatsApp means picking TWO transports stacked: stdio JSON-RPC between agent and MCP server, then a WhatsApp-side transport (Meta Cloud HTTPS, whatsmeow WebSocket, browser CDP, or macOS accessibility).",
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

export default function WhatsappAiAgentTransportPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen pb-24">
        {/* Hero */}
        <BackgroundGrid pattern="dots" glow>
          <div className="max-w-3xl mx-auto px-6 pt-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <section className="max-w-3xl mx-auto px-6 pt-8 pb-14">
            <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
              guide
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.14]">
              The WhatsApp AI agent transport is{" "}
              <GradientText>two transports</GradientText>, not one
            </h1>
            <p className="text-base md:text-lg text-zinc-700 leading-relaxed mb-4">
              Most guides about wiring an AI agent to WhatsApp talk about one
              transport. There are two. The first is the boring one (stdio
              JSON-RPC between the agent and the MCP server). The second is
              the one that actually decides whether your number gets banned,
              whether you burn a linked-device slot, and whether your bot still
              works after Meta&apos;s next reship.
            </p>
            <p className="text-sm md:text-base text-zinc-500 leading-relaxed mb-8">
              Written for someone who landed here from a thread, on a phone,
              wondering which path to commit to.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="/install">
                See the no-credential path
              </ShimmerButton>
              <a
                href={GITHUB}
                className="text-sm font-medium text-teal-700 hover:text-teal-600"
              >
                source on GitHub &rarr;
              </a>
            </div>
          </section>
        </BackgroundGrid>

        {/* Direct answer */}
        <section className="max-w-3xl mx-auto px-6 mt-12">
          <ShineBorder borderRadius={16} color={["#06b6d4", "#14b8a6"]}>
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-teal-700 mb-3">
                Direct answer &mdash; verified 2026-05-20
              </p>
              <p className="text-lg md:text-xl text-zinc-900 font-semibold leading-snug mb-3">
                A WhatsApp AI agent uses{" "}
                <span className="text-teal-700">two transports stacked</span>:
                JSON-RPC over stdio between the agent and the MCP server, then
                a WhatsApp-side transport (Meta Cloud HTTPS, whatsmeow
                WebSocket, browser CDP, or macOS accessibility) between the
                MCP server and WhatsApp itself.
              </p>
              <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
                The agent-side transport is defined by the{" "}
                <a
                  href={MCP_TRANSPORTS_SPEC}
                  className="text-teal-700 underline"
                  rel="noopener"
                >
                  MCP transports spec
                </a>{" "}
                and almost always resolves to stdio. The WhatsApp-side
                transport is your real architectural decision, and there is no
                spec for it.
              </p>
            </div>
          </ShineBorder>
        </section>

        <div className="mt-10">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="6 min read"
          />
        </div>

        {/* The two transports, visualized */}
        <section className="max-w-3xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            One call, two transports, four hops
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-7">
            A single tool call from the agent to WhatsApp traverses two
            transport layers. The first connects the agent process to the MCP
            server. The second connects the MCP server to whatever surface of
            WhatsApp it knows how to talk to. They are different protocols,
            different file descriptors, different failure modes.
          </p>
          <SequenceDiagram
            title="A WhatsApp send, end to end"
            actors={transportActors}
            messages={transportMessages}
          />
          <p className="text-sm text-zinc-500 leading-relaxed mt-5">
            The agent-side hop is always JSON-RPC framed bytes over a pipe.
            The WhatsApp-side hop is one of four very different things,
            depending on which MCP you installed.
          </p>
        </section>

        {/* Agent-side transport */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            The agent-side transport: stdio, almost always
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            On the agent side, the MCP host (Claude Code, Cursor, Windsurf,
            whatever you use) forks the child process named in your config
            and frames JSON-RPC messages on its stdin and stdout. There is no
            port, no TLS, no firewall question, no CORS dance. The official{" "}
            <a
              href={MCP_TRANSPORTS_SPEC}
              className="text-teal-700 underline"
              rel="noopener"
            >
              MCP transports specification
            </a>{" "}
            defines stdio and Streamable HTTP as the two standard transports,
            with SSE marked legacy. Local MCP servers pick stdio because
            anything else is overkill.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed mb-6">
            On whatsapp-mcp-macos, that decision is one line:
          </p>
          <AnimatedCodeBlock
            code={stdioTransportCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift (lines 1190-1193)"
          />
          <p className="text-sm text-zinc-500 leading-relaxed mt-4">
            The host forks{" "}
            <code className="text-xs bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              whatsapp-mcp
            </code>{" "}
            (from the npm install), reads tool definitions from its stdout,
            and forwards every tool call onto the same pipe. If you ever swap
            this MCP for a remote one, Streamable HTTP is the right choice;
            the agent doesn&apos;t care which one it is.
          </p>
        </section>

        {/* WhatsApp-side transport */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            The WhatsApp-side transport: four very different choices
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-7">
            Past the stdio pipe, the MCP server has to actually reach
            WhatsApp. There is no single API for an LLM to use, so four real
            transports have emerged. Each one is a different protocol with
            different operational consequences. This is the choice that
            matters.
          </p>
          <ComparisonTable
            productName="What it is, and where it ends"
            competitorName="The transport, plus an example MCP"
            rows={whatsappTransportRows}
            caveat="The Cloud API is the right choice for B2B opted-in broadcasts. whatsmeow is the right choice for personal Linux bots that can tolerate the MCP holding session credentials. macOS accessibility is the right choice on macOS when the auth surface should not exist at all."
          />
        </section>

        {/* The accessibility transport, in detail */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            What an accessibility transport actually looks like
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            People nod at &quot;macOS accessibility&quot; in the comparison
            table and move on. It deserves more than that, because as a
            transport it is genuinely strange. There is no JSON, no socket,
            no Meta endpoint. The request goes out as a posted CGEvent (a
            click, a keystroke). The response comes back as a re-walk of the
            on-screen accessibility tree, the same tree VoiceOver uses.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed mb-6">
            Concretely: after the server pastes text and posts a Return event,
            it walks the AX tree of WhatsApp, filters for{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              AXGenericElement
            </code>{" "}
            rows whose description starts with the literal string{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              &quot;Your message, &quot;
            </code>
            , and prefix-matches the body it just sent. If the match holds,
            the tool returns{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              verified: true
            </code>
            . That second walk is the response half of the transport.
          </p>
          <AnimatedCodeBlock
            code={axTransportCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift (lines 484-510, paraphrased)"
          />
          <p className="text-sm text-zinc-500 leading-relaxed mt-4">
            Open{" "}
            <a
              href={MAIN_SWIFT}
              className="text-teal-700 underline"
              rel="noopener"
            >
              main.swift on GitHub
            </a>{" "}
            and grep for{" "}
            <code className="text-xs bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              traverseAXTree
            </code>{" "}
            and{" "}
            <code className="text-xs bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              &quot;Your message, &quot;
            </code>
            . Both are right there. The Business Cloud API path returns a
            queued status and tells you to wait for a webhook; the whatsmeow
            path returns an internal message id. Only this transport
            re-reads the conversation to confirm the bubble rendered.
          </p>
        </section>

        {/* Why the second transport is the real choice */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            Why the second transport is the real architectural choice
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            The agent-side transport (stdio vs Streamable HTTP) is a
            deployment-topology decision. Local? Stdio. Remote? Streamable
            HTTP. The MCP spec gives a clean answer in two sentences and you
            move on.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            The WhatsApp-side transport is a relationship-with-Meta decision,
            and it changes the entire risk shape of your project:
          </p>
          <ul className="list-disc pl-5 space-y-3 text-base text-zinc-700 leading-relaxed mb-4">
            <li>
              <strong className="text-zinc-900">
                Business Cloud API
              </strong>{" "}
              means you have a tenant, a phone number id, an access token,
              webhooks. You operate inside Meta&apos;s pricing and template
              rules. Honest, but heavy.
            </li>
            <li>
              <strong className="text-zinc-900">
                whatsmeow / web-multidevice
              </strong>{" "}
              means the MCP process IS your linked device. The session
              credentials live in a file on the server. If the bridge
              misbehaves or the process crashes badly, you can lose the slot
              and the number both.
            </li>
            <li>
              <strong className="text-zinc-900">Headless WhatsApp Web</strong>{" "}
              piles on a Chromium that downloads a fresh bundle from
              web.whatsapp.com every boot. The transport ends in DOM
              selectors and webpack module names that Meta owes nobody.
            </li>
            <li>
              <strong className="text-zinc-900">
                macOS accessibility
              </strong>{" "}
              means there are no credentials in the MCP, no linked device
              consumed, no new presence on the WhatsApp servers. The auth is
              whatever the desktop app is signed in as, full stop. Cost: it
              only runs on macOS with the desktop app open.
            </li>
          </ul>
          <p className="text-base text-zinc-700 leading-relaxed">
            Pick the WhatsApp-side transport that matches the risk shape you
            can live with, then pick whatever agent-side transport your host
            already wants. The order of those two decisions is almost always
            wrong in the existing playbooks.
          </p>
        </section>

        {/* Footer CTA */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <BookCallCTA
            appearance="footer"
            destination={CAL_LINK}
            site="WhatsApp MCP"
            heading="Stuck on the WhatsApp-side transport choice?"
            description="Talk it through with the person who built the macOS-accessibility path before you commit to one."
          />
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
            Questions people ask before committing to a transport
          </h2>
          <FaqSection items={faqItems} heading="" />
        </section>

        {/* Related */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination={CAL_LINK}
        site="WhatsApp MCP"
        description="Questions about the WhatsApp-side transport? Book a quick call."
      />
    </>
  );
}
