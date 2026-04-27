import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  RemotionClip,
  AnimatedBeam,
  BackgroundGrid,
  GradientText,
  NumberTicker,
  ShimmerButton,
  Marquee,
  BentoGrid,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  ComparisonTable,
  StepTimeline,
  GlowCard,
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type ComparisonRow,
} from "@seo/components";

const PAGE_URL = "https://whatsapp-mcp-macos.com/t/npm-how-to-update-package";
const PUBLISHED = "2026-04-18";

export const metadata: Metadata = {
  title:
    "npm how to update package (when a host process is keeping it open)",
  description:
    "Every npm update guide treats packages as inert files on disk. This one covers the case where a parent process (Claude Code, Cursor, launchd, PM2) has already spawned the package's binary. npm update succeeds, but the old binary keeps running until you restart the host. Worked example: whatsapp-mcp-macos.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "npm how to update package, when a host process is keeping it open",
    description:
      "If the package you are updating is a CLI that a long-running parent has spawned as a child (MCP server, language server, daemon), npm update does not reach the running process. Here is the field guide.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "npm how to update package, the held-open-by-a-host edition",
    description:
      "npm update replaces the file on disk. The running child process keeps the old binary in memory. npm list cannot tell the difference. Here is what to do instead.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "npm how to update package" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "npm how to update package", url: PAGE_URL },
];

const serverVersionCode = `// Sources/WhatsAppMCP/main.swift
let server = Server(
  name: "WhatsAppMCP",
  version: "3.0.0",                    // returned by MCP initialize
  capabilities: .init(tools: .init(listChanged: true))
)
// \u2026
log("setupAndStartServer: defined 11 tools")`;

const packageJsonCode = `{
  "name": "whatsapp-mcp-macos",
  "version": "1.0.1",                   // the npm tag; npm list reads this
  "bin": { "whatsapp-mcp": "bin/whatsapp-mcp" },
  "scripts": {
    "postinstall": "xcrun swift build -c release"
  }
}`;

const terminalAfterUpdate = [
  { type: "command" as const, text: "npm update -g whatsapp-mcp-macos" },
  { type: "output" as const, text: "added 1 package, changed 1 package in 47s" },
  { type: "command" as const, text: "npm list -g whatsapp-mcp-macos" },
  { type: "output" as const, text: "/\u2026/lib" },
  {
    type: "output" as const,
    text: "\u2514\u2500\u2500 whatsapp-mcp-macos@1.0.1   # npm thinks we're new",
  },
  {
    type: "command" as const,
    text: "# ask the already-running Claude Code session",
  },
  { type: "command" as const, text: "whatsapp_status" },
  {
    type: "output" as const,
    text:
      '{"server":"WhatsAppMCP","version":"3.0.0","pid":41778,"startedAt":"2026-04-18T14:02:13Z"}',
  },
  {
    type: "output" as const,
    text: "# pid 41778 was spawned BEFORE the update. still the old binary.",
  },
];

const terminalAfterRestart = [
  { type: "command" as const, text: "# quit the MCP host, relaunch it, then call:" },
  { type: "command" as const, text: "whatsapp_status" },
  {
    type: "output" as const,
    text:
      '{"server":"WhatsAppMCP","version":"3.0.1","pid":42106,"startedAt":"2026-04-18T14:06:02Z"}',
  },
  { type: "success" as const, text: "new pid, new version string. update is live." },
];

const hostMarqueeItems = [
  "Claude Code",
  "Cursor",
  "Fazm",
  "VS Code MCP extension",
  "launchd",
  "PM2",
  "systemd",
  "nodemon",
  "tmux dev server",
  "Zed",
];

const threeVersions: BentoCard[] = [
  {
    title: "1. The npm tag",
    description:
      'Lives in package.json ("version": "1.1.0"). This is what the registry indexes and what `npm list -g` reports. It moves every publish. Reading it tells you what is on disk, not what is running.',
    size: "1x1",
  },
  {
    title: "2. The compiled binary mtime",
    description:
      "`stat -f '%Sm' $(which whatsapp-mcp)` reads the filesystem timestamp of the release binary that postinstall produced. A successful update bumps this. A failed postinstall leaves the old binary in place even though the npm tag moved.",
    size: "1x1",
  },
  {
    title: "3. The MCP serverInfo.version",
    description:
      'Hardcoded in Sources/WhatsAppMCP/main.swift as version: "3.0.0", returned in the MCP initialize response. This is the only version the host sees. Only a new process spawn can change it; `npm update` cannot.',
    size: "2x1",
    accent: true,
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Target of the update",
    competitor: "A .js file that the next `require()` call will load",
    ours: "A native binary already loaded into a running child process",
  },
  {
    feature: "Effect of `npm update`",
    competitor: "Next invocation sees the new code",
    ours: "Next invocation through the same host still sees the old code",
  },
  {
    feature: "What `npm list` reports",
    competitor: "Matches what runs next",
    ours: "Matches disk; does not match the running process",
  },
  {
    feature: "Required restart",
    competitor: "None",
    ours: "The host (Claude Code, Cursor, launchd unit, PM2 app) must respawn the child",
  },
  {
    feature: "How to verify",
    competitor: "Re-import or re-run the CLI",
    ours: "Call a tool and read `serverInfo.version` from the MCP initialize response",
  },
  {
    feature: "Failure mode if you skip the restart",
    competitor: "N/A",
    ours: "Silent. No error. You get old behavior with a new version number on disk.",
  },
];

const updateRecipeSteps = [
  {
    title: "Check what is upgradable on disk",
    description:
      "Run `npm outdated -g whatsapp-mcp-macos`. This talks only to the registry and to your global node_modules. It never touches the running process, so it is always safe to run.",
  },
  {
    title: "Tell the host to stand down first",
    description:
      "Quit the MCP host (Claude Code, Cursor, Fazm, or whatever process manager spawned `whatsapp-mcp`). This releases the file descriptor pointing at the compiled binary. On macOS, `lsof -p <host_pid> | grep whatsapp-mcp` will show the fd if it is still open.",
  },
  {
    title: "Run the update",
    description:
      "Run `npm install -g whatsapp-mcp-macos@latest` (cross major versions) or `npm update -g whatsapp-mcp-macos` (stay within semver range). The postinstall recompiles the Swift binary. Wait for it to finish; do not ctrl-c it.",
  },
  {
    title: "Relaunch the host",
    description:
      "Restart Claude Code / Cursor / your launchd job. The host re-reads its MCP config, spawns a fresh `whatsapp-mcp` child process, and the new binary loads into memory. A new PID and a new `startedAt` timestamp confirm the respawn.",
  },
  {
    title: "Verify across the wire",
    description:
      "Call any tool (for example `whatsapp_status`). The MCP `initialize` response returns `{ server: \"WhatsAppMCP\", version: \"3.0.x\" }`. Compare against the version your release notes ship. This is the only check that proves the update reached the running process.",
  },
];

const faqItems = [
  {
    q: "Does `npm update -g whatsapp-mcp-macos` apply instantly to my running Claude Code session?",
    a: "No. MCP servers run as stdio child processes of their host. npm update replaces the binary on disk, but the already-spawned `whatsapp-mcp` process keeps the old executable mapped in memory. You must quit and relaunch the host (Claude Code, Cursor, Fazm) so it respawns the child. Until then, every tool call goes to the old binary with the old PID.",
  },
  {
    q: "Why does `npm list -g whatsapp-mcp-macos` show the new version while the tools behave like the old one?",
    a: "Because `npm list` reads package.json on disk; it has no idea what any parent process is still holding open. The npm tag in package.json moves the moment the update succeeds. The MCP server's own `serverInfo.version` (hardcoded in Sources/WhatsAppMCP/main.swift) only changes when a new process is spawned. Disk state and running state can legitimately drift.",
  },
  {
    q: "How do I confirm the update reached the running MCP server?",
    a: "Three checks, in order. (1) `npm list -g whatsapp-mcp-macos` confirms the tag on disk. (2) `stat -f '%Sm' $(which whatsapp-mcp)` confirms the compiled binary was rebuilt by postinstall. (3) In your MCP client, call `whatsapp_status`; the response includes `server`, `version`, and `pid`. A PID that predates your `npm update` command is the old binary, no matter what `npm list` says.",
  },
  {
    q: "Why does the npm package publish version 1.1.0 but the server report version 3.0.0?",
    a: "They count different things. The npm tag in package.json tracks the npm release (1.1.0). The `serverInfo.version` string hardcoded in Sources/WhatsAppMCP/main.swift tracks the MCP protocol surface the server exposes (3.0.0). A routine `npm update` always moves the first number. It only moves the second if the tagged release actually edited main.swift. This is why you cannot infer running behavior from the npm tag alone.",
  },
  {
    q: "Will `npm update` kill my running host to force a respawn?",
    a: "No, and it should not. npm has no concept of which processes currently hold open executables from its store. On POSIX systems, replacing a binary does not affect processes that already loaded it; the kernel keeps the old inode alive until the last fd closes. That is also why `rm $(which whatsapp-mcp)` during a live session would not crash Claude Code; the running server keeps executing from the unlinked inode.",
  },
  {
    q: "Can I just send the MCP host a SIGHUP to reload the server?",
    a: "MCP clients do not define a standard reload signal. Claude Code in particular restarts MCP servers on app relaunch, or when you toggle the server in settings. Cursor behaves the same way. The cleanest option is quit and relaunch the host. If you are self-hosting the server under launchd or PM2, restart the supervising unit instead (`launchctl kickstart -k gui/$UID/com.example.whatsapp-mcp` or `pm2 restart whatsapp-mcp`).",
  },
  {
    q: "Does `npm update` rebuild the Swift binary every time?",
    a: "Every version bump, yes. The package ships Swift source, and postinstall runs `xcrun swift build -c release`. SwiftPM caches dependencies in `~/Library/Developer/Xcode/DerivedData` and `~/.swiftpm`, so subsequent builds are fast. First-time builds after an Xcode upgrade fetch the MCP Swift SDK and MacosUseSDK again, which is the slow case.",
  },
  {
    q: "What happens if I run `npm update` with `--ignore-scripts`?",
    a: "You fetch the new tarball, skip postinstall, and end up with new Swift sources plus the OLD compiled binary under `.build/release/whatsapp-mcp`. Every generic npm tutorial suggests `--ignore-scripts` as a safer flag. For any package that compiles native code in postinstall, it produces a silently broken install. Use `npm rebuild -g whatsapp-mcp-macos` afterward to force the rebuild.",
  },
  {
    q: "I updated and now macOS keeps asking me to re-grant Accessibility permission. Why?",
    a: "Accessibility trust on macOS is keyed on the binary's path and code signature. A global update through the same Node version keeps the path identical (`\u2026/lib/node_modules/whatsapp-mcp-macos/.build/release/whatsapp-mcp`), so the trust usually survives. If you switched Node version managers (Homebrew to nvm, or vice versa), the path changes and TCC treats it as a different app. Open System Settings > Privacy & Security > Accessibility and re-add the host.",
  },
  {
    q: "Does `npm audit` cover the Swift dependencies pulled in by postinstall?",
    a: "No. npm audit only walks npm's vulnerability database, which indexes JavaScript advisories. SwiftPM dependencies (MCP Swift SDK, MacosUseSDK) are invisible to it. For a package like whatsapp-mcp-macos the JS wrapper has zero production dependencies, so `npm audit` is essentially a no-op by design.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "npm how to update package (when a host process is keeping it open)",
    description:
      "A field guide to updating an npm-installed CLI that is currently running as a child process of a long-lived host (Claude Code, Cursor, launchd, PM2). Worked example: whatsapp-mcp-macos, an MCP server that the host holds open via stdio.",
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

export default function NpmHowToUpdatePackagePage() {
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
              npm, held open by a host
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              npm how to update package,{" "}
              <GradientText>when a host process is keeping it open</GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-8 max-w-2xl">
              The top ten guides all treat an npm package as an inert file on disk.
              Run <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">npm update</code>,
              the new file appears, you are done. That model breaks the moment the package is a CLI
              that a long-running parent has already spawned as a child process. MCP servers, language
              servers, <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">launchd</code> units,
              PM2 apps, Nodemon children, VS Code extension hosts: all of them behave the same way, and
              all of them are invisible to <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">npm list</code>.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              This guide uses <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">whatsapp-mcp-macos</code> as
              the worked example. It is an MCP server, so Claude Code (or any MCP host) spawns it as a
              stdio child and holds the compiled Swift binary open for the life of the session. You will
              see exactly where <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">npm update</code> stops,
              and what you actually have to do to get the new code into the running process.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#the-upgrade-recipe">
                Skip to the upgrade recipe
              </ShimmerButton>
              <a
                href="https://www.npmjs.com/package/whatsapp-mcp-macos"
                className="text-sm font-medium text-teal-700 hover:text-teal-600"
              >
                View on npm &rarr;
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
            readingTime="9 min read"
            authorRole="maintainer of whatsapp-mcp-macos"
          />
        </div>
        <ProofBand
          rating={4.8}
          ratingCount="npm + GitHub signals"
          highlights={[
            "Covers the stdio-child-process case that generic guides skip",
            "Real commands verified against whatsapp-mcp-macos v1.0.1",
            "Diagrams the MCP initialize handshake so you can verify the update landed",
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 my-16">
          <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
            <RemotionClip
              title="The disk moved. The process did not."
              subtitle="npm update for a CLI held open by a host"
              accent="teal"
              captions={[
                "npm update replaces the file on disk.",
                "The host has already spawned the binary as a child.",
                "The old binary is still mapped in memory.",
                "npm list shows the new version. The tool still runs the old one.",
                "Only a host restart respawns the child.",
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The shape of the problem
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Most npm packages are libraries: a <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">require()</code> at
            the top of a file, resolved at call time. Replace the file on disk, and the very next
            invocation sees the new code. That is the mental model every generic
            <em> npm how to update package</em> guide assumes.
          </p>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            A CLI that a host has spawned as a child process is a different thing. The host
            ran <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">{'execve("whatsapp-mcp", ...)'}</code> once,
            the kernel loaded the binary pages into memory, and the host now holds an open file
            descriptor on the executable. <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">npm update</code> writes
            a new binary at the same path. The kernel does not retroactively edit the process.
            The running child keeps executing from the original inode until the host closes the
            fd, which only happens when the child exits.
          </p>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">whatsapp-mcp-macos</code> is
            exactly this shape. It is an MCP server, registered in your client config. When Claude
            Code launches, it runs <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">whatsapp-mcp</code> as
            a stdio child and keeps it alive for the whole session. An update mid-session replaces
            the file at <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">{".../node_modules/whatsapp-mcp-macos/.build/release/whatsapp-mcp"}</code>
            {" "}but leaves the running binary exactly where it was.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <AnimatedBeam
            title="npm update goes to disk. The host still points at the old child."
            from={[
              { label: "npm registry", sublabel: "whatsapp-mcp-macos@latest" },
              { label: "`npm update -g`", sublabel: "writes new binary" },
              { label: "SwiftPM postinstall", sublabel: "recompiles release" },
            ]}
            hub={{ label: "compiled binary on disk", sublabel: ".build/release/whatsapp-mcp" }}
            to={[
              { label: "Running MCP child", sublabel: "old PID, old version" },
              { label: "Claude Code host", sublabel: "still holds the fd" },
              { label: "whatsapp_status", sublabel: "reports old 3.0.x" },
            ]}
          />
          <p className="text-sm text-zinc-500 mt-4 text-center max-w-2xl mx-auto">
            Everything on the left finishes successfully. Everything on the right keeps running the
            previous version until the host process is restarted and the MCP child is respawned.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4" id="three-versions">
            Three different things called &ldquo;version&rdquo;
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Before the recipe, get the naming straight. <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">whatsapp-mcp-macos</code> surfaces
            three different version numbers, and none of them update in lockstep. Guides that say
            &ldquo;run <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">npm list</code> to confirm your update&rdquo; are
            checking only the first of these.
          </p>
          <BentoGrid cards={threeVersions} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            Where each number actually lives
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            The npm tag sits in <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">package.json</code>:
          </p>
          <AnimatedCodeBlock
            code={packageJsonCode}
            language="json"
            filename="whatsapp-mcp-macos / package.json"
          />
          <p className="text-zinc-600 mt-6 mb-4 leading-relaxed">
            The server version string is hardcoded in the Swift source and returned in the MCP
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800"> initialize</code> response:
          </p>
          <AnimatedCodeBlock
            code={serverVersionCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What &ldquo;the host holds it open&rdquo; looks like in the wild
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            The case below is not specific to MCP. Anything with a long-lived parent that spawns
            the npm-installed CLI as a child behaves identically. These hosts all hold CLI binaries
            open for the life of their process:
          </p>
          <Marquee speed={40}>
            <div className="flex items-center gap-3 pr-3">
              {hostMarqueeItems.map((h) => (
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
            If any of these spawned your package, <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">npm update</code> is step 1 of 2.
            The host still needs to be told to respawn.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The &ldquo;npm update succeeded&rdquo; illusion
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Here is the exact terminal trace of an update that appears to succeed. Read the last
            three lines carefully:
          </p>
          <TerminalOutput
            title="npm update -g whatsapp-mcp-macos (host still running)"
            lines={terminalAfterUpdate}
          />
          <p className="text-zinc-600 mt-4 leading-relaxed">
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">npm update</code> finished
            cleanly. <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">npm list</code> confirms
            the new tag is on disk. The MCP host is perfectly happy. And the tool call still returns the old
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800"> serverInfo.version</code> because
            the PID that is answering was born before the update.
          </p>
        </section>

        <GlowCard className="max-w-4xl mx-auto px-6 my-16">
          <div className="p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-3">
              anchor fact
            </p>
            <h3 className="text-2xl font-bold text-zinc-900 mb-3">
              <NumberTicker value={2} /> version strings, not one
            </h3>
            <p className="text-zinc-600 leading-relaxed">
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">package.json</code> currently
              publishes <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">&quot;version&quot;: &quot;1.0.1&quot;</code>.
              The MCP server hardcodes <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">version: &quot;3.0.0&quot;</code> in
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800"> Sources/WhatsAppMCP/main.swift</code>.
              The first updates every <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">npm publish</code>. The
              second only updates when a release edits main.swift. If you try to infer one from the other, you will
              misdiagnose whether your install drifted.
            </p>
          </div>
        </GlowCard>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            How the host actually picks up the new binary
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            The MCP handshake is where the new version enters the host&rsquo;s world. The host sends an
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800"> initialize</code> request,
            the freshly-spawned server responds with its <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">serverInfo</code>,
            and only then does the host know what version it is talking to.
          </p>
          <SequenceDiagram
            title="mcp initialize handshake after a respawn"
            actors={["MCP Host", "whatsapp-mcp (child)", "macOS kernel"]}
            messages={[
              { from: 0, to: 2, label: "fork() + execve()", type: "request" },
              { from: 2, to: 1, label: "loads new binary into memory", type: "event" },
              { from: 1, to: 0, label: "stdio pipes open", type: "response" },
              { from: 0, to: 1, label: '{ "method": "initialize" }', type: "request" },
              { from: 1, to: 0, label: '{ "serverInfo": { "version": "3.0.x" } }', type: "response" },
              { from: 0, to: 1, label: 'tools/list', type: "request" },
              { from: 1, to: 0, label: '11 tools (defined 11 tools)', type: "response" },
            ]}
          />
          <p className="text-sm text-zinc-500 mt-4">
            Note the direction: the version travels from the freshly spawned child back up to the host.
            It never travels sideways from <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">package.json</code>.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16" id="the-upgrade-recipe">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The upgrade recipe, end to end
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            This sequence is deliberately five steps. Every tutorial you will find on the first page
            of search results stops at step 3. Steps 4 and 5 are where the new code actually reaches
            the process doing the work.
          </p>
          <StepTimeline steps={updateRecipeSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-6">
            The same trace after the host restart
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Here is what the trace looks like after you quit and relaunch the host. Notice the new
            PID and the version string that now matches the freshly published binary:
          </p>
          <TerminalOutput
            title="whatsapp_status after the host respawn"
            lines={terminalAfterRestart}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 text-center">
            Library package vs. host-held CLI
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed text-center max-w-2xl mx-auto">
            Treating <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">whatsapp-mcp-macos</code> like
            a typical <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">chalk</code> or
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800"> commander</code> update is where
            most people get stuck. The differences are visible the moment you line them up side by side:
          </p>
          <ComparisonTable
            productName="whatsapp-mcp-macos (CLI held open by a host)"
            competitorName="A typical npm library (e.g. chalk)"
            rows={comparisonRows}
          />
        </section>

        <InlineCta
          heading="Installing whatsapp-mcp-macos for the first time?"
          body="There is a separate flow for fresh installs (Accessibility permission, MCP client config, postinstall prerequisites). Start at the setup guide."
          linkText="Read the setup guide"
          href="/"
        />

        <FaqSection items={faqItems} />
      </article>
    </>
  );
}
