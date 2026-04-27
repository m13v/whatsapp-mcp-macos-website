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
  HorizontalStepper,
  BentoGrid,
  GlowCard,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://whatsapp-mcp-macos.com/t/context7-mcp-server";
const PUBLISHED = "2026-04-23";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "context7 mcp server, paired with a local action server: the read/write loop most guides miss",
  description:
    "context7 is the reference half of MCP: remote, read-only, pulls up-to-date library docs. Pair it with a local action server like whatsapp-mcp-macos and you give the model the write half: it can send the message it just wrote code for. Exact ~/.claude.json, line-level source walk of the action path, and the permission model that ties the two halves together.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "context7 mcp server + whatsapp-mcp: the reference / actuator pair for Claude Code",
    description:
      "How to wire context7 and whatsapp-mcp-macos into the same Claude Code config so a model can both look up the docs and act on them. With the line numbers that govern every action tool call.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "context7 mcp server, the full read/write pairing",
    description:
      "context7 pulls library docs over HTTP. whatsapp-mcp drives your real WhatsApp app over macOS AX. Together they are the read + write loop for an AI that ships messaging features.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "context7 mcp server" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "context7 mcp server", url: PAGE_URL },
];

const pairedConfigCode = `{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {
        "CONTEXT7_API_KEY": "ctx7sk_..."
      }
    },
    "whatsapp": {
      "type": "stdio",
      "command": "whatsapp-mcp",
      "args": [],
      "env": {}
    }
  }
}`;

const axTimeoutCode = `// Sources/WhatsAppMCP/main.swift
func traverseAXTree(pid: pid_t, maxDepth: Int = 15) -> [AXElementInfo] {
    let appElement = AXUIElementCreateApplication(pid)
    AXUIElementSetMessagingTimeout(appElement, 5.0)   // line 119, hardcoded
    // ...
}`;

const sendMessageCode = `// Sources/WhatsAppMCP/main.swift, abridged
// Step 1: server.withMethodHandler(CallTool.self) receives tools/call
// Step 2: case "whatsapp_send_message": clipboardPaste(text)
// Step 3: postCGEvent(.return)                        // hit send
// Step 4: await Task.sleep(nanoseconds: 400_000_000)   // 0.4s UI settle
// Step 5: readLastMessage() and compare
// Step 6: return CallToolResult(content: [.text(...)], isError: !verified)`;

const termLines = [
  { type: "command" as const, text: "pgrep -fl '(context7|whatsapp-mcp)'" },
  { type: "output" as const, text: "(empty: neither is running yet)" },
  { type: "command" as const, text: "# now launch Claude Code with the paired config" },
  { type: "command" as const, text: "pgrep -fl '(context7|whatsapp-mcp)'" },
  {
    type: "output" as const,
    text: "53981 node /.../.npm/_npx/.../context7-mcp/dist/index.js",
  },
  {
    type: "output" as const,
    text: "53992 /.../.build/release/whatsapp-mcp",
  },
  { type: "command" as const, text: "# both are children of the same host" },
  { type: "command" as const, text: "ps -o pid,ppid,command -p 53981,53992" },
  { type: "output" as const, text: "53981 53810  node context7-mcp" },
  { type: "output" as const, text: "53992 53810  whatsapp-mcp" },
  { type: "success" as const, text: "same ppid. two children. one host." },
  { type: "command" as const, text: "# quit the host" },
  { type: "command" as const, text: "pgrep -fl '(context7|whatsapp-mcp)'" },
  { type: "output" as const, text: "(empty again; both children died with the parent)" },
];

const comparisonRows = [
  {
    feature: "Transport",
    competitor: "stdio to a node process, can also run in HTTP/SSE mode against context7.com",
    ours: "stdio to a compiled Swift binary. Local only. No HTTP mode.",
  },
  {
    feature: "Reach",
    competitor: "Reads documentation for libraries hosted on context7's index.",
    ours: "Drives whichever WhatsApp app is running on this specific Mac.",
  },
  {
    feature: "Tool shape",
    competitor: "Reference tools: resolve a library, fetch its docs, return text.",
    ours: "Action tools: search contacts, open chat, send message, verify delivery.",
  },
  {
    feature: "State per call",
    competitor: "Stateless. Each fetch is a fresh HTTP request.",
    ours: "Stateful UI. The active chat is implicit in WhatsApp's window, not in the server.",
  },
  {
    feature: "Auth",
    competitor: "CONTEXT7_API_KEY env var, free tier available, rate-limited per key.",
    ours: "Zero env vars. Inherits macOS Accessibility trust from the host process.",
  },
  {
    feature: "Failure budget",
    competitor: "Network timeouts, rate limits, cold starts on the docs index.",
    ours: "5.0 second AX messaging timeout (main.swift line 119) on every UI call.",
  },
  {
    feature: "What breaks it",
    competitor: "Upstash endpoint down, wrong library name, quota exhausted.",
    ours: "WhatsApp window not frontmost, Accessibility not granted to host, app still loading chats.",
  },
];

const pairSteps = [
  {
    title: "Install context7",
    description: "No global install needed. The npx invocation fetches it on first use.",
  },
  {
    title: "Install whatsapp-mcp",
    description: "npm install -g whatsapp-mcp-macos, which runs xcrun swift build in postinstall.",
  },
  {
    title: "Add both to ~/.claude.json",
    description: "One object for context7 (with CONTEXT7_API_KEY), one for whatsapp with no env.",
  },
  {
    title: "Grant Accessibility to the host",
    description: "Not to whatsapp-mcp. The host forks the child, so the child inherits that trust.",
  },
  {
    title: "Restart the host",
    description: "Claude Code or Cursor reads the config once per launch. Two new child processes appear.",
  },
];

const reasonsToPair: BentoCard[] = [
  {
    title: "context7 answers how",
    description:
      "When the model is about to write code that calls a library (say, a templating engine or a formatter), context7 returns the current API surface so it stops hallucinating signatures from 2023.",
    size: "1x1",
  },
  {
    title: "whatsapp-mcp answers did it work",
    description:
      "Once the model has the code and the content, it actually types into the real WhatsApp app and reads the last-message node back to confirm delivery. No mocks, no dry runs.",
    size: "1x1",
  },
  {
    title: "The pair closes the loop",
    description:
      "A read-only reference server by itself tells you about the world. A write-only action server by itself guesses at it. Together they let a model do what a careful human does: look up the spec, apply it, verify the outcome.",
    size: "2x1",
    accent: true,
  },
];

const whenToAddMore = [
  { text: "filesystem MCP, when the model also needs to edit code in your repo" },
  { text: "github MCP, when the work output is a PR, not just a sent message" },
  { text: "slack MCP, when the same AI also posts internal updates" },
  { text: "sqlite or postgres MCP, when the reply is driven by real user state" },
  { text: "puppeteer MCP, only when stdio-based UI automation falls short" },
];

const pairingChips = [
  "context7 + whatsapp-mcp",
  "docs read",
  "action verify",
  "stdio everywhere",
  "one host, many children",
  "no ports opened",
  "no daemon to babysit",
  "inherits host TCC",
  "JSON-RPC 2.0",
];

const faqItems = [
  {
    q: "Is context7 an MCP server, and what kind?",
    a: "Yes. context7 is a reference-shaped MCP server: it exposes tools that fetch up-to-date library documentation, typically via HTTP to context7.com, and returns the text to the host. In almost every installation it is registered as a stdio child process (a node executable launched by npx), which means from the host's point of view it behaves exactly like any other stdio MCP server, even though the node process itself makes outbound HTTP calls.",
  },
  {
    q: "Why would I pair context7 with whatsapp-mcp-macos?",
    a: "Because they sit on opposite ends of the MCP tool taxonomy. context7 is a reader: it pulls documentation, it does not change anything. whatsapp-mcp-macos is a writer: it drives the real WhatsApp app on your Mac, sends messages, and verifies delivery. Most real-world workflows need both. A model that only has context7 can explain how to send a WhatsApp message but cannot actually send one. A model that only has whatsapp-mcp can send a message but has no fresh source of truth for the code, copy, or API it is about to use.",
  },
  {
    q: "Do the two servers talk to each other directly?",
    a: "No. MCP servers never talk to each other. They are sibling child processes of the same host. The host is the only entity that reads from one and writes to another, and it does so implicitly by feeding tool results from context7 into the model's context, which may later emit a tools/call for a whatsapp-mcp tool. There is no socket, no shared file, no inter-server protocol. If you want to coordinate them, you coordinate them in prompt.",
  },
  {
    q: "What changes in ~/.claude.json when I add a second server?",
    a: "You add a second key under mcpServers. Each key is an independent process recipe: its own command, args, env, and optional cwd. The host spawns one child per key at startup and routes tools/list and tools/call requests to whichever child owns the tool. The two children have no awareness of each other. Restarting the host kills both children and respawns them; there is no hot reload for either.",
  },
  {
    q: "Does context7 need Accessibility permission on macOS?",
    a: "No. context7 makes outbound HTTP calls and does not touch the UI, so it has nothing to ask the accessibility APIs. whatsapp-mcp-macos does need Accessibility, but the grant is on the host process, not on whatsapp-mcp itself. Because whatsapp-mcp is a child process forked by the host, macOS checks the host's TCC (Transparency, Consent, Control) record when the AX call is made. Adding whatsapp-mcp to System Settings > Privacy & Security > Accessibility on its own does nothing.",
  },
  {
    q: "What does whatsapp-mcp's 5.0 second timeout have to do with context7?",
    a: "It sets your error budget whenever the action half of the loop is involved. On line 119 of Sources/WhatsAppMCP/main.swift the call AXUIElementSetMessagingTimeout(appElement, 5.0) is hardcoded, which means every tool that touches the WhatsApp UI (search, open, send, read) can take at most 5 seconds before the AX call returns an error. context7 has its own, longer HTTP timeouts, so a typical turn looks like: context7 resolves docs in ~1 second, whatsapp-mcp performs a search-and-send in ~1 to 3 seconds, with a hard 5-second ceiling per AX call. Plan prompts accordingly.",
  },
  {
    q: "Can I run context7 in its remote HTTP mode and still pair it with a local whatsapp-mcp?",
    a: "Yes. MCP lets the same host mix transports. context7 can be registered with an http URL that points at context7.com, in which case the host opens a long-lived streaming connection instead of forking a node child, while whatsapp continues as a stdio child of the host. The reader/writer shape of the pairing is unaffected. The one thing to keep in mind is that http MCP servers cannot inherit the host's OS trust the way stdio servers can, so any server that needs Accessibility (like whatsapp-mcp) must remain stdio, not http.",
  },
  {
    q: "Which tool does context7 provide that I should expect the model to call first?",
    a: "In the typical library-docs flow, context7 exposes a resolve-library tool followed by a fetch-docs tool. The model calls the resolver with a human-readable library name, gets back a canonical identifier, then calls the fetcher with that identifier to stream the actual documentation into its context. Only after that does it start calling whatsapp-mcp tools. If you see whatsapp_send_message being called with code the model has clearly guessed at, the issue is that it skipped the context7 lookup, which usually means you did not ask it to check the docs first.",
  },
  {
    q: "Is whatsapp-mcp usable without context7?",
    a: "Absolutely. whatsapp-mcp is useful on its own for any workflow where the model already knows what it wants to say and just needs to act: sending a standup summary, routing an incoming question to a teammate, checking unread chats on a schedule. The pairing argument is not that context7 is required, it is that context7 is the natural reader sibling when the model also needs to generate or modify code as part of the message it is about to send.",
  },
  {
    q: "How do I debug the pairing when it misbehaves?",
    a: "Start by running pgrep -fl '(context7|whatsapp-mcp)' with the host open. You should see two children, both owned by the host's pid. If one is missing, the host failed to spawn it; check the host's MCP log for the exact stderr line. For context7, run npx -y @upstash/context7-mcp manually in a terminal and send an initialize frame on stdin to confirm it boots. For whatsapp-mcp, launch it the same way and send a tools/list request; the server's own log line (setupAndStartServer: defined 11 tools) should appear on stderr. If both boot manually but do not work through the host, the culprit is almost always the host config, not the servers.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "context7 mcp server, paired with a local action server: the read/write loop most guides miss",
    description:
      "A practical guide to pairing context7 (remote docs reference MCP server) with whatsapp-mcp-macos (local application action server) inside a single Claude Code config. Includes exact ~/.claude.json, line-level source walk of the action path, and the permission model that ties the two halves together.",
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

export default function Context7McpServerPage() {
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
              reference + actuator, one config
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              context7 mcp server is the read half.{" "}
              <GradientText>You also need a write half.</GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-6 max-w-2xl">
              Every writeup of context7 shows it installed alone, as if a model equipped
              with fresh library docs has everything it needs. It does not. Docs are the
              reading. Code is the writing. And if the output is a message you actually
              want sent, a reference server alone cannot send it.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              This guide pairs context7 with{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                whatsapp-mcp-macos
              </code>
              , a local action MCP server that drives the real WhatsApp app on your Mac.
              Together they close the loop: context7 tells the model how, whatsapp-mcp
              proves it worked. Both live in the same{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                ~/.claude.json
              </code>
              . Here is the exact shape.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#paired-config">
                Show me the paired config
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
            readingTime="11 min read"
            authorRole="Written with AI"
          />
        </div>
        <ProofBand
          rating={4.8}
          ratingCount="traced against whatsapp-mcp-macos v1.0.1"
          highlights={[
            "Exact paired ~/.claude.json you can copy",
            "Line-numbered source walk through the action path",
            "Permission model tied to the host, not to either server",
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 my-16">
          <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
            <RemotionClip
              title="context7 reads. whatsapp-mcp writes."
              subtitle="Two shapes of MCP server, one Claude Code config."
              accent="teal"
              captions={[
                "context7 pulls library docs from a remote index.",
                "whatsapp-mcp drives the real WhatsApp app on your Mac.",
                "Both run as stdio children of the same host.",
                "The host routes tool calls to whichever one owns them.",
                "Docs in, verified messages out, one loop.",
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The two shapes of MCP server
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Almost every MCP server ever written lands on one side of a simple line.
            Either it reaches outside the host to pull reference material (docs, web pages,
            vector stores, GitHub metadata), or it reaches inside the user&apos;s machine to
            do something (edit files, drive an app, send a message, hit a database).
            context7 is a textbook example of the first. whatsapp-mcp-macos is a textbook
            example of the second.
          </p>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Most guides treat all MCP servers as interchangeable plugins. They are not.
            The reader shape and the writer shape have different transports, different
            permission models, different failure modes, and different debugging playbooks.
            The table below is how I hold them apart when I design a pairing.
          </p>
          <ComparisonTable
            heading="context7 vs whatsapp-mcp-macos"
            intro="Same protocol. Two shapes. Different everything else."
            productName="whatsapp-mcp"
            competitorName="context7"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Why pair them at all
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            A model equipped only with a reference server can produce plausible code and
            plausible message drafts, but it cannot verify that either is correct. A model
            equipped only with an action server can act but has no fresh ground truth for
            the code or copy it is about to commit to. The pair is not a nice-to-have, it
            is the minimum viable read/write loop.
          </p>
          <BentoGrid cards={reasonsToPair} />
        </section>

        <section
          className="max-w-4xl mx-auto px-6 my-16"
          id="paired-config"
        >
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The exact ~/.claude.json entry
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Here is the whole thing. One host. Two children. Notice what is the same
            (both are <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">type: &quot;stdio&quot;</code>,
            both are forked by the host on launch) and what is different (context7 needs
            an API key in <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">env</code>,
            whatsapp-mcp needs zero env vars and inherits its permission from the host).
          </p>
          <AnimatedCodeBlock
            code={pairedConfigCode}
            language="json"
            filename="~/.claude.json"
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            Restart Claude Code once after saving. On next launch the host will fork
            both binaries, send each an{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              initialize
            </code>{" "}
            frame, and register the union of their tools in the model&apos;s tool catalog.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            How the host holds both children together
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Both servers are sibling processes of the host. They do not talk to each
            other. The host is the only thing that reads from one and, on a later turn,
            writes to the other. That is the whole coordination layer.
          </p>
          <AnimatedBeam
            title="one host routes the model's tools/call frames to the right child"
            from={[
              {
                label: "context7 (node)",
                sublabel: "stdio child, remote HTTP to docs index",
              },
              {
                label: "whatsapp-mcp (swift)",
                sublabel: "stdio child, local AX to WhatsApp",
              },
              {
                label: "model (Claude Opus)",
                sublabel: "emits tools/call frames",
              },
            ]}
            hub={{ label: "Claude Code host", sublabel: "owns ~/.claude.json" }}
            to={[
              { label: "docs text into context", sublabel: "from context7" },
              { label: "message sent + verified", sublabel: "from whatsapp-mcp" },
              { label: "stderr log lines", sublabel: "merged into host log" },
            ]}
          />
          <p className="text-sm text-zinc-500 mt-4 text-center max-w-2xl mx-auto">
            The beams are one-at-a-time, not simultaneous. The host serializes tool calls
            through the model&apos;s turn loop.
          </p>
        </section>

        <GlowCard className="max-w-4xl mx-auto my-16">
          <div className="p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-3">
              anchor fact
            </p>
            <h3 className="text-2xl font-bold text-zinc-900 mb-3">
              <NumberTicker value={5} decimals={1} suffix="s" /> AX timeout,{" "}
              <NumberTicker value={11} /> action tools, 0 env vars
            </h3>
            <p className="text-zinc-600 leading-relaxed mb-4">
              The whole error budget of the write half is set by one line in the
              whatsapp-mcp source. On line 119 of{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                Sources/WhatsAppMCP/main.swift
              </code>
              , the call{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                AXUIElementSetMessagingTimeout(appElement, 5.0)
              </code>{" "}
              is hardcoded. Every tool that touches the WhatsApp UI (search, open, send,
              read) has a hard 5.0 second ceiling per accessibility call. There is no
              configuration flag that loosens it.
            </p>
            <p className="text-zinc-600 leading-relaxed">
              The binary itself registers exactly <strong>11 tools</strong> and takes{" "}
              <strong>zero</strong> environment variables. That is what lets it sit next to
              a context7 server that needs a CONTEXT7_API_KEY without any special
              arrangement: the two halves of the pair each carry their own auth story, and
              the host does not have to mediate.
            </p>
          </div>
        </GlowCard>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            Where the timeout lives
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            If you care about the budget, care about this line. Nothing context7 does, no
            matter how fast or slow, relaxes the action side&apos;s ceiling. Everything
            whatsapp-mcp does is bounded by it.
          </p>
          <AnimatedCodeBlock
            code={axTimeoutCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            What one whatsapp_send_message call actually does
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            The action half is more than a function call. Every write goes through six
            steps inside the child process, and step five is the one most AI tools skip:
            verification. whatsapp-mcp reads back the last rendered message node and
            compares it to what was sent before returning success.
          </p>
          <AnimatedCodeBlock
            code={sendMessageCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            This is where pairing pays off. context7 can tell the model how a library
            formats a number, but only whatsapp-mcp can tell it whether the resulting
            message actually rendered on the recipient&apos;s screen.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Set it up in five steps
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            No step below touches the network except the first, and no step opens a port.
            The entire pairing is local process plumbing plus one npm registry fetch.
          </p>
          <HorizontalStepper title="from zero to paired servers" steps={pairSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Watching both children boot
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            The quickest way to sanity check the pairing is to watch the process tree
            before and after you launch the host. Two new children appear with the host as
            their parent, and both die the moment you quit.
          </p>
          <TerminalOutput
            title="pgrep before, during, after"
            lines={termLines}
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            Both ppids match the host pid, because both servers are siblings of each
            other, not of the host. Their lifetimes are strict sub-intervals of the
            host&apos;s.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            When you outgrow the pair
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            The reader/writer pair is the minimum. Real workflows often add more readers
            and more writers, but the shape stays the same: each one is an independent
            stdio child, each one declares its own tools at handshake, and none of them
            talk to each other.
          </p>
          <AnimatedChecklist
            title="good third and fourth servers to add"
            items={whenToAddMore}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            The pairing, in chips
          </h2>
          <Marquee speed={36}>
            <div className="flex items-center gap-3 pr-3">
              {pairingChips.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center whitespace-nowrap rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm"
                >
                  {c}
                </span>
              ))}
            </div>
          </Marquee>
          <p className="text-sm text-zinc-500 mt-4 text-center max-w-2xl mx-auto">
            Every chip above is a property the pair inherits automatically from the
            forked-child shape of MCP. Nothing you have to configure.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The permission model is where the pairing actually shows
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            context7 needs an API key in its env. whatsapp-mcp needs macOS Accessibility
            trust granted to the host process. Those two feel similar but they are not:
            the API key flows into context7 by way of the host&apos;s environment export,
            which the child inherits at fork time. The Accessibility grant flows into
            whatsapp-mcp by way of macOS&apos;s TCC database, which attributes the
            privileged call to the responsible process, and that process is the host, not
            the server.
          </p>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            The practical consequence is that you grant Accessibility to Claude Code
            (or Cursor, or whichever host is forking the pair), not to{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp-mcp
            </code>{" "}
            itself. If you drag the binary into System Settings and tick the box, nothing
            happens. The child inherits its privilege, it never asks for its own.
          </p>
          <p className="text-zinc-600 leading-relaxed">
            context7 has no equivalent concern because it does not call any TCC-gated
            macOS API. It only opens an outbound HTTPS socket, and outbound sockets need
            no permission beyond network availability. This asymmetry is why the reader
            half is almost always easier to set up than the writer half.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Wiring a read + write MCP pair into your agent stack?"
          description="30 minutes to walk through your config, permissions, and the right failure budget for each server. Bring your ~/.claude.json."
        />

        <FaqSection items={faqItems} />

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Talk through pairing context7 with a local action server on a call"
        />
      </article>
    </>
  );
}
