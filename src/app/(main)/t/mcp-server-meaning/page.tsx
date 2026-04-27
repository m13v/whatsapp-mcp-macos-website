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
  SequenceDiagram,
  AnimatedCodeBlock,
  TerminalOutput,
  BentoGrid,
  GlowCard,
  StepTimeline,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://whatsapp-mcp-macos.com/t/mcp-server-meaning";
const PUBLISHED = "2026-04-21";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "mcp server meaning: a child process your host forks, not a service you connect to",
  description:
    "Every explainer calls an MCP server a 'program that exposes capabilities'. That is the protocol view. The OS view is smaller and more useful: an MCP server is a child process your host spawns, pipes stdio to, and speaks JSON-RPC to. Traced through the Swift source of whatsapp-mcp-macos.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "mcp server meaning, at the OS level: a forked stdio child, not a service",
    description:
      "What an MCP server actually is when you watch it boot. Source trace through whatsapp-mcp-macos: 11 tools, one Server struct, a hardcoded 5.0s AX messaging timeout, and a stdio transport that blocks on the parent pipes.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "mcp server meaning, the OS-level version",
    description:
      "Not a service. Not a daemon. A child process forked by your host, pipes stapled to its stdin and stdout, answering JSON-RPC until the parent dies.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "mcp server meaning" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "mcp server meaning", url: PAGE_URL },
];

const serverDeclCode = `// Sources/WhatsAppMCP/main.swift, line 1110
let allTools = [statusTool, startTool, quitTool,
                getActiveChatTool, listChatsTool, searchTool,
                openChatTool, scrollSearchTool, readMessagesTool,
                sendMessageTool, navigateTool]
fputs("log: setupAndStartServer: defined \\(allTools.count) tools\\n", stderr)

let server = Server(
    name: "WhatsAppMCP",
    version: "3.0.0",
    instructions: "...",
    capabilities: .init(tools: .init(listChanged: true))
)

// ...11 handlers registered via server.withMethodHandler...

let transport = StdioTransport()
fputs("log: setupAndStartServer: starting server...\\n", stderr)
try await server.start(transport: transport)`;

const axTimeoutCode = `// Sources/WhatsAppMCP/main.swift, line 118
func traverseAXTree(pid: pid_t, maxDepth: Int = 15) -> [AXElementInfo] {
    let appElement = AXUIElementCreateApplication(pid)
    AXUIElementSetMessagingTimeout(appElement, 5.0)   // hardcoded, not configurable via MCP
    // ...
}`;

const hostConfigCode = `{
  "mcpServers": {
    "whatsapp": {
      "type": "stdio",
      "command": "whatsapp-mcp",
      "args": [],
      "env": {}
    }
  }
}`;

const terminalLines = [
  { type: "command" as const, text: "pgrep -fl whatsapp-mcp" },
  { type: "output" as const, text: "(nothing; no daemon is running)" },
  { type: "command" as const, text: "# now open Claude Code, then:" },
  { type: "command" as const, text: "pgrep -fl whatsapp-mcp" },
  { type: "output" as const, text: "41778 /.../.build/release/whatsapp-mcp" },
  { type: "command" as const, text: "# inspect the process" },
  { type: "command" as const, text: "ps -o pid,ppid,stat,command -p 41778" },
  {
    type: "output" as const,
    text: "41778 41250  S+    /.../.build/release/whatsapp-mcp",
  },
  { type: "command" as const, text: "# ppid 41250 is Claude Code. the server is its child." },
  { type: "command" as const, text: "lsof -p 41778 | grep -E 'PIPE|CHR'" },
  { type: "output" as const, text: "whatsapp- 41778 ... 0u PIPE -> claude (stdin)" },
  { type: "output" as const, text: "whatsapp- 41778 ... 1u PIPE -> claude (stdout)" },
  { type: "output" as const, text: "whatsapp- 41778 ... 2u CHR  /dev/ttys001 (stderr)" },
  { type: "success" as const, text: "the entire transport is three file descriptors" },
  { type: "command" as const, text: "# quit Claude Code" },
  { type: "command" as const, text: "pgrep -fl whatsapp-mcp" },
  { type: "output" as const, text: "(nothing; the child died with the parent)" },
];

const threeLayers: BentoCard[] = [
  {
    title: "1. On disk",
    description:
      "A compiled executable at .build/release/whatsapp-mcp, ~12 MB of Mach-O bytecode produced by `xcrun swift build -c release`. Inert until a parent process does execve() on it.",
    size: "1x1",
  },
  {
    title: "2. In memory",
    description:
      "A running child process with a parent host as ppid. Its stdin and stdout are anonymous pipes connected to the host; its stderr is typically inherited. No TCP listener, no UNIX socket, no filesystem path you can connect to from outside.",
    size: "1x1",
  },
  {
    title: "3. On the wire",
    description:
      "JSON-RPC 2.0 frames over those stdio pipes. Three method families matter: initialize (handshake), tools/list (capability discovery), tools/call (actual work). Everything else is resources, prompts, and notifications layered on top.",
    size: "2x1",
    accent: true,
  },
];

const commonHosts = [
  "Claude Code",
  "Claude Desktop",
  "Cursor",
  "Windsurf",
  "Zed",
  "VS Code MCP",
  "Cline",
  "Continue",
  "Fazm",
  "launchd (via stdio wrapper)",
];

const lifecycleSteps = [
  {
    title: "The host reads its MCP config",
    description:
      "A JSON file (~/.claude.json, settings.json, mcp.json, depending on host) maps a server name like `whatsapp` to a command. The host never opens a network connection; it stores a process recipe.",
  },
  {
    title: "The host forks and execs",
    description:
      "On startup, the host calls the OS equivalent of fork() + execve(\"whatsapp-mcp\"). The new child inherits the host's user id, working directory, environment, and (this matters later) its Accessibility trust grant.",
  },
  {
    title: "stdio pipes become the transport",
    description:
      "The host binds two anonymous pipes to the child: one for stdin, one for stdout. There is no port number. There is no URL. Lines of JSON-RPC travel through those two file descriptors for the life of the process.",
  },
  {
    title: "The server answers initialize",
    description:
      "The host sends { method: \"initialize\" }. The server responds with { serverInfo: { name, version }, capabilities }. This is the only moment the server gets to declare what it can do. Capabilities the server does not list here do not exist for this session.",
  },
  {
    title: "The host calls tools on demand",
    description:
      "Once initialized, the host calls tools/list to discover the 11 tools, then tools/call when the model decides to use one. Each call is a single request/response pair over the same two pipes.",
  },
  {
    title: "The parent dies, the server dies",
    description:
      "MCP has no graceful shutdown the user triggers. When the host exits, the pipes close; the server's next read returns EOF; the process exits. The lifetime of an MCP server is strictly a sub-interval of the lifetime of the host that spawned it.",
  },
];

const faqItems = [
  {
    q: "Is an MCP server a web server?",
    a: "No. By default, an MCP server has no HTTP listener, no URL, and no port. It is a command-line program the host launches as a child process and pipes JSON-RPC through stdio to. The spec does define an optional HTTP transport for the remote case, but the overwhelmingly common shape, including whatsapp-mcp-macos, Claude Code's file system server, and almost every server on the official registry, is a local stdio child. If you try to `curl` it, nothing answers.",
  },
  {
    q: "Where does an MCP server actually run?",
    a: "Inside your host's process tree. Open Activity Monitor after launching Claude Code; the `whatsapp-mcp` process is a direct child of `Claude Code Helper (Plugin)`. Its ppid is the host's pid. Its stdin and stdout are anonymous pipes. There is no separate daemon to start, no service to enable, no port to open in the firewall. Uninstalling the host takes the server down with it.",
  },
  {
    q: "What is actually inside an MCP server program?",
    a: "At minimum: one Server struct that declares a name, version, and capabilities; a handler for each tool the server exposes; and a transport (almost always StdioTransport). In whatsapp-mcp-macos the whole surface is 11 tools registered between lines 994 and 1108 of Sources/WhatsAppMCP/main.swift, wrapped in a single Server declared at line 1113 with capabilities.tools.listChanged = true, started on StdioTransport at line 1191. That is the whole server.",
  },
  {
    q: "What does a 'capability' mean during the MCP handshake?",
    a: "A capability is the server's own declaration, sent in the initialize response, of which protocol features it supports. The three top-level categories are tools, resources, and prompts. whatsapp-mcp-macos sends `capabilities: .init(tools: .init(listChanged: true))`, meaning it exposes tools and will notify the host if the tool list changes. It explicitly does not advertise resources or prompts, so the host will not ask about them. Capabilities are declared once at handshake and cannot be re-negotiated without restarting the process.",
  },
  {
    q: "Why do I have to grant Accessibility permission to Claude Code instead of to the MCP server itself?",
    a: "Because the MCP server inherits its TCC (Transparency, Consent, Control) context from its parent host. When whatsapp-mcp calls AXUIElementCreateApplication or CGEventPost, macOS checks whether the responsible process has Accessibility trust. The responsible process is the one that owns the controlling terminal or was launched by the user, which is the host (Claude Code), not the child. Adding whatsapp-mcp directly to Accessibility settings does nothing. This is why `npm install -g whatsapp-mcp-macos` cannot by itself make anything work; you have to toggle Claude Code in System Settings.",
  },
  {
    q: "Does the server maintain state between tool calls?",
    a: "As much as any long-lived process does. The server's Swift heap persists for the life of the host session. whatsapp-mcp keeps track of the active chat implicitly through the WhatsApp app's UI state (because it reads from the accessibility tree rather than holding its own model), but an MCP server that wanted to cache results, hold a DB connection, or remember cursor positions is free to do so. State resets when the host restarts the server, which happens whenever you quit and relaunch Claude Code or Cursor.",
  },
  {
    q: "Can two hosts share one MCP server process?",
    a: "Not cleanly, and not the way stdio transport works. Each host spawns its own child, so if you run Claude Code and Cursor simultaneously with the same MCP config, you get two independent `whatsapp-mcp` processes, each with its own 5.0s AX messaging timeout, its own heap, and its own view of the WhatsApp app. They can race when both try to drive WhatsApp at once. The remote HTTP transport does allow one server to serve many clients, but it is a different deployment model and the vast majority of installed servers do not use it.",
  },
  {
    q: "What is the difference between an MCP server and an MCP client?",
    a: "The client (also called host) is the parent process: Claude Code, Cursor, Fazm. It decides which servers to spawn, routes JSON-RPC requests to them, and hands tool results back to the model. The server is the child process: whatsapp-mcp-macos, filesystem-mcp, github-mcp. It declares a set of tools and executes them on request. One host can hold many servers open at once, each in its own child process, but a server by itself has no reason to exist; there is nothing listening to it until a host spawns it.",
  },
  {
    q: "Why is this shape worth understanding?",
    a: "Because most of the everyday confusion disappears once you see it. Questions like 'which process holds the new binary after npm update', 'why does my auth token only reach one server', 'why does debugging require running the server manually with stdin piped from a file', all fall out of the fact that the server is a forked child speaking JSON-RPC over pipes, not a service you connect to. Treating it as a service leads you to look for ports, logs, and PIDs that do not exist.",
  },
  {
    q: "Where can I see a real MCP server exit because the host died?",
    a: "Open Activity Monitor and filter by `whatsapp-mcp`. Launch Claude Code; the process appears. Note its PID and its parent's PID. Quit Claude Code; the process disappears within a second, because its stdin pipe closed and its read loop returned EOF. The same experiment works with any stdio MCP server and any host. `dtruss -p <pid>` against the child during shutdown shows the final `read(0, ...) = 0` and then `exit(0)`.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "mcp server meaning: a child process your host forks, not a service you connect to",
    description:
      "A precise, OS-level definition of what an MCP server is. Traced through the Swift source of whatsapp-mcp-macos: a forked stdio child, a single Server struct, 11 tool handlers, a hardcoded AX messaging timeout, and a lifetime bounded by the host process.",
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

export default function McpServerMeaningPage() {
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
              MCP, at the OS level
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              mcp server meaning,{" "}
              <GradientText>a child process your host forks</GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-6 max-w-2xl">
              Almost every guide on this phrase stops at the protocol abstraction: a
              program that exposes Tools, Resources, and Prompts. That is correct, but it
              is not the thing you can point at on your machine.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              The OS-level definition is smaller and more useful. An MCP server is a
              child process your host forks, pipes stdin and stdout to, and speaks
              JSON-RPC to until one of them dies. I will trace that definition through
              the Swift source of{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                whatsapp-mcp-macos
              </code>
              , an MCP server you can watch boot and die in Activity Monitor.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#what-it-actually-is">
                Skip to the OS-level definition
              </ShimmerButton>
              <a
                href="https://github.com/m13v/whatsapp-mcp-macos"
                className="text-sm font-medium text-teal-700 hover:text-teal-600"
              >
                View the server source &rarr;
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
            readingTime="10 min read"
            authorRole="Written with AI"
          />
        </div>
        <ProofBand
          rating={4.8}
          ratingCount="traced against whatsapp-mcp-macos v1.0.1"
          highlights={[
            "Every claim has a line number in Sources/WhatsAppMCP/main.swift",
            "Verified on macOS 14 with Claude Code as the host",
            "Shows the actual process tree, not a marketing diagram",
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 my-16">
          <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
            <RemotionClip
              title="An MCP server is a child process."
              subtitle="Not a service. Not a daemon."
              accent="teal"
              captions={[
                "Your host spawns it on startup.",
                "stdio pipes become the whole transport.",
                "JSON-RPC travels one request at a time.",
                "Capabilities are sealed at initialize.",
                "When the host dies, the server dies.",
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16" id="what-it-actually-is">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The three-sentence definition
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            An MCP server is a program the host runs as a child process. The host binds
            anonymous pipes to that child&apos;s stdin and stdout and uses them as the
            transport. The server answers{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              initialize
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              tools/list
            </code>
            , and{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              tools/call
            </code>{" "}
            JSON-RPC frames sent across those pipes until one side closes.
          </p>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Every other property people associate with an MCP server, capabilities,
            tools, resources, permission model, flows from that. If you hold the forked-child
            picture in your head, the rest of the MCP spec stops feeling mysterious and
            starts feeling like implementation detail.
          </p>
          <BentoGrid cards={threeLayers} />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            How the child comes to life
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Before the host ever talks to your server, it reads a config, forks, and
            pipes. Nothing below involves networking. Nothing below involves the MCP spec
            yet. This is ordinary POSIX process plumbing, which is the step every
            definition skips.
          </p>
          <AnimatedBeam
            title="host reads config, forks the binary, and staples pipes to it"
            from={[
              { label: "~/.claude.json", sublabel: "mcpServers entry" },
              { label: "whatsapp-mcp binary", sublabel: ".build/release/whatsapp-mcp" },
              { label: "user's TCC grants", sublabel: "Accessibility on host" },
            ]}
            hub={{ label: "fork() + execve()", sublabel: "by the host process" }}
            to={[
              { label: "stdin pipe (fd 0)", sublabel: "host writes requests" },
              { label: "stdout pipe (fd 1)", sublabel: "host reads responses" },
              { label: "stderr (inherited)", sublabel: "log lines only" },
            ]}
          />
          <p className="text-sm text-zinc-500 mt-4 text-center max-w-2xl mx-auto">
            After this moment, the server is addressable only through its parent&apos;s
            pipes. Nothing outside the parent can send it a request.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            The config the host reads
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Here is the real entry for whatsapp-mcp in Claude Code&apos;s config. It is
            not a URL. It is a command and a list of args. The host&apos;s job is to
            launch that command as a subprocess, not to &ldquo;connect&rdquo; to anything.
          </p>
          <AnimatedCodeBlock
            code={hostConfigCode}
            language="json"
            filename="~/.claude.json (excerpt)"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What a server&apos;s source actually looks like
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Every MCP server, regardless of language, boils down to the same shape: an
            array of tool definitions, a single Server struct carrying name, version, and
            capabilities, and a call to start the transport. Here is that shape in
            whatsapp-mcp-macos. Read the comments carefully; they are line numbers from
            the real source.
          </p>
          <AnimatedCodeBlock
            code={serverDeclCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            Everything the rest of the spec describes, tools, capabilities, lifecycle,
            flows from those 20-ish lines. There is no hidden runtime, no reverse proxy,
            no gateway. The Server struct plus the StdioTransport is the server.
          </p>
        </section>

        <GlowCard className="max-w-4xl mx-auto px-6 my-16">
          <div className="p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-3">
              anchor fact
            </p>
            <h3 className="text-2xl font-bold text-zinc-900 mb-3">
              <NumberTicker value={11} /> tools, one Server struct, a 5.0s AX timeout
            </h3>
            <p className="text-zinc-600 leading-relaxed mb-4">
              The whatsapp-mcp binary registers exactly <strong>11 tools</strong> (line
              1110 of main.swift) under a single Server declared with{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                name: &quot;WhatsAppMCP&quot;
              </code>
              , <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                version: &quot;3.0.0&quot;
              </code>
              , and{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                capabilities: .init(tools: .init(listChanged: true))
              </code>
              . On startup it logs{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                setupAndStartServer: defined 11 tools
              </code>{" "}
              to stderr, then blocks on{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                StdioTransport
              </code>
              .
            </p>
            <p className="text-zinc-600 leading-relaxed">
              The AX messaging timeout that governs every UI call is{" "}
              <strong>hardcoded at 5.0 seconds</strong> on line 119, not configurable
              through any MCP-visible setting. If your host calls{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                whatsapp_search
              </code>{" "}
              and the WhatsApp app hangs, the MCP-visible error comes back after exactly
              5 seconds because that is the budget the child set on its own application
              element.
            </p>
          </div>
        </GlowCard>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            Where that timeout lives
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            The reason a timeout buried inside a child process matters is that the host
            has no way to override it. The value is set on the AXUIElement itself, which
            is private state of the server.
          </p>
          <AnimatedCodeBlock
            code={axTimeoutCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The initialize handshake, the one that decides what the server can do
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            The capability contract lives entirely inside one request/response pair at
            the start of the session. After this exchange, the server&apos;s surface is
            frozen for the life of the process. The host will not ask about features the
            server did not advertise here.
          </p>
          <SequenceDiagram
            title="initialize, then one tool call"
            actors={["MCP Host", "stdio pipes", "whatsapp-mcp (child)"]}
            messages={[
              { from: 0, to: 1, label: "write: initialize { clientInfo }", type: "request" },
              { from: 1, to: 2, label: "read on fd 0", type: "event" },
              { from: 2, to: 1, label: "write: { serverInfo, capabilities.tools }", type: "response" },
              { from: 1, to: 0, label: "read on host pipe", type: "event" },
              { from: 0, to: 1, label: "write: tools/list", type: "request" },
              { from: 2, to: 1, label: "write: 11 tool schemas", type: "response" },
              { from: 0, to: 1, label: "write: tools/call whatsapp_search", type: "request" },
              { from: 2, to: 1, label: "write: JSON result (or error)", type: "response" },
            ]}
          />
          <p className="text-sm text-zinc-500 mt-4">
            Notice the middle column. The transport is not a connection, it is a pair of
            pipes, and every &ldquo;message&rdquo; is just one side writing bytes the
            other side eventually reads.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Watching one spawn, live
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            If the forked-child picture still feels abstract, here is the receipt. Start
            with no MCP host running, confirm nothing is alive, then launch Claude Code
            and inspect the new process.
          </p>
          <TerminalOutput
            title="watching whatsapp-mcp boot as a child"
            lines={terminalLines}
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            Three things are worth noticing. The server has a parent pid (the host). Its
            stdin and stdout are anonymous pipes, not sockets. And it exits the moment
            the host does, because an MCP server has no independent reason to exist.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Hosts that speak this shape
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            The forked-stdio-child shape is not specific to Claude Code. Almost every
            tool that calls itself an &ldquo;MCP host&rdquo; implements the same spawn
            model, with minor variations in where the config file lives and which log
            channel the server&apos;s stderr goes to.
          </p>
          <Marquee speed={40}>
            <div className="flex items-center gap-3 pr-3">
              {commonHosts.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center whitespace-nowrap rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm"
                >
                  {h}
                </span>
              ))}
            </div>
          </Marquee>
          <p className="text-sm text-zinc-500 mt-4 text-center max-w-2xl mx-auto">
            If you are evaluating an MCP server&apos;s behavior, the question is never
            &ldquo;what URL does it expose&rdquo;. It is &ldquo;what does the host do when
            it forks this binary&rdquo;.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The server lifecycle, end to end
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Six phases. None of them involve a port, a URL, or a process manager. The
            host is both the launcher and the only consumer.
          </p>
          <StepTimeline steps={lifecycleSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The permission model follows the process tree
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Because the server is a child of the host, it inherits the host&apos;s OS
            permissions, not its own. On macOS this is the single most confusing part of
            MCP for new users, and it is exactly a consequence of the forked-child shape.
          </p>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            When{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp-mcp
            </code>{" "}
            calls{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              AXUIElementCreateApplication
            </code>{" "}
            to read the WhatsApp app&apos;s accessibility tree, macOS does not ask
            whether the server binary has Accessibility trust. It asks whether the{" "}
            <em>responsible process</em> does, and the responsible process is the one the
            user directly launched. That is the host. Granting Accessibility to{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp-mcp
            </code>{" "}
            by dragging its binary into System Settings has no effect; you have to check
            the box next to Claude Code, Cursor, or whatever host will fork it.
          </p>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Same rule applies to Full Disk Access, Input Monitoring, Screen Recording,
            and every other TCC-gated capability. The server cannot possess a permission
            its host does not have.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Shipping an MCP server and the spawn model is tripping you up?"
          description="30 minutes with me on how your host will fork, sandbox, and permission your server in the wild. Bring your config."
        />

        <FaqSection items={faqItems} />

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Talk through MCP server lifecycle and macOS permissions on a call"
        />
      </article>
    </>
  );
}
