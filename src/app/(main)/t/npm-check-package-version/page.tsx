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
  MetricsRow,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type ComparisonRow,
} from "@seo/components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/npm-check-package-version";
const PUBLISHED = "2026-04-24";
const BOOKING_URL = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "npm-check package version (the three numbers the same install returns)",
  description:
    "`npm-check`, `npm outdated`, `npm view`, `npm list -g` and the server handshake all claim to tell you the version of a package. For whatsapp-mcp-macos they return three different numbers from the same install: 1.0.1, 1.1.0, and 3.0.0. Here is what each command is actually measuring, and which one tells you the truth.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "npm-check package version, the three numbers the same install returns",
    description:
      "A version check is not a single query. For packages that ship a runtime, the npm tag, the on-disk package.json, and the runtime's own serverInfo all move on their own clocks. Worked example with whatsapp-mcp-macos.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "npm-check package version: why five commands return three different answers",
    description:
      "Inside a single install of whatsapp-mcp-macos: 1.0.1 from npm view, 1.1.0 from npm list, 3.0.0 from the MCP initialize handshake. Which one do you trust?",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "npm-check package version" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "npm-check package version", url: PAGE_URL },
];

const serverSwiftCode = `// Sources/WhatsAppMCP/main.swift, line 1113
let server = Server(
    name: "WhatsAppMCP",
    version: "3.0.0",      // <- this is what the client sees
    instructions: """
    WhatsApp MCP server for macOS. Controls the native ...
    """,
    capabilities: .init(...)
)`;

const packageJsonCode = `{
  "name": "whatsapp-mcp-macos",
  "version": "1.1.0",        // <- source tree, not yet published
  "os": ["darwin"],
  "bin": { "whatsapp-mcp": "bin/whatsapp-mcp" },
  "scripts": {
    "postinstall": "xcrun swift build -c release"
  }
}`;

const npmRegistryCode = `{
  "name": "whatsapp-mcp-macos",
  "dist-tags": { "latest": "1.0.1" },
  "versions": {
    "1.0.0": { ... },
    "1.0.1": { ... }
  },
  "time": {
    "1.0.0": "2026-03-18T03:04:26.453Z",
    "1.0.1": "2026-03-18T03:18:50.915Z"
  }
}`;

const versionCommands: BentoCard[] = [
  {
    title: "npm view <pkg> version",
    description:
      "Asks the npm registry over HTTPS. Returns the latest dist-tag from registry.npmjs.org. For whatsapp-mcp-macos that is 1.0.1, the last thing published. It never touches your disk, so it has no idea whether you even have the package installed.",
    size: "2x1",
    accent: true,
  },
  {
    title: "npm list -g <pkg>",
    description:
      "Reads package.json under `npm config get prefix` / lib/node_modules. For a global install, returns the version field baked into the tarball you actually have on disk. This may be ahead of (or behind) the latest registry tag.",
    size: "1x1",
  },
  {
    title: "npm outdated -g",
    description:
      "Compares every local global's package.json version against the registry's latest dist-tag. Reports a pair (current, wanted, latest). Fast, but it is only ever a two-way diff between two strings from package.json.",
    size: "1x1",
  },
  {
    title: "npm-check -g -u",
    description:
      "Third-party CLI (`npm install -g npm-check`). Same underlying data as `npm outdated` plus a prompt-driven updater. Does not know about any version string that is not in package.json.",
    size: "1x1",
  },
  {
    title: "MCP initialize handshake",
    description:
      "The only command that talks to the running process. The host sends `initialize`, the server returns `{ serverInfo: { name, version } }`. For whatsapp-mcp-macos that returns 3.0.0, hardcoded in main.swift. No npm command can see this number.",
    size: "2x1",
  },
];

const commandsMarqueeItems = [
  "npm view",
  "npm list -g",
  "npm ls -g --depth=0",
  "npm outdated",
  "npm-check",
  "npx npm-check -g",
  "npm info <pkg> version",
  "cat package.json | jq .version",
  "initialize (MCP)",
  "stat $(which whatsapp-mcp)",
];

const beamFrom = [
  { label: "npm view", sublabel: "HTTPS GET registry.npmjs.org" },
  { label: "npm list / npm-check", sublabel: "reads package.json on disk" },
  { label: "MCP initialize", sublabel: "JSON-RPC over stdio" },
];

const beamHub = {
  label: "whatsapp-mcp-macos",
  sublabel: "one install, three identifiers",
};

const beamTo = [
  { label: "1.0.1", sublabel: "the published npm tag" },
  { label: "1.1.0", sublabel: "the on-disk package.json" },
  { label: "3.0.0", sublabel: "the serverInfo.version" },
];

const commandComparisonRows: ComparisonRow[] = [
  {
    feature: "Data source",
    competitor: "A string in package.json on disk (or on the registry)",
    ours: "A string hardcoded in Sources/WhatsAppMCP/main.swift, returned over JSON-RPC by the running process",
  },
  {
    feature: "What a bump in this number means",
    competitor: "Someone edited `\"version\"` and ran `npm publish` or `npm install`",
    ours:
      "Someone edited main.swift, ran `swift build`, and the host spawned a new child process",
  },
  {
    feature: "How fast a version change propagates",
    competitor:
      "Instantly on the next `npm install` or registry query. Files on disk are overwritten.",
    ours:
      "Only when the host spawns a fresh child. Long-running Claude Code / Cursor sessions hold the old version until restart.",
  },
  {
    feature: "Can `npm-check` detect a mismatch?",
    competitor: "Yes. That is its entire purpose.",
    ours:
      "No. `npm-check` cannot read the MCP handshake. It will happily show `up to date` while a stale 3.0.0 binary is still running.",
  },
  {
    feature: "Where the number is physically stored",
    competitor:
      "lib/node_modules/whatsapp-mcp-macos/package.json, plus the registry",
    ours:
      "Compiled into the Mach-O at .build/release/whatsapp-mcp (constant string inside the binary)",
  },
  {
    feature: "Command that reveals it",
    competitor: "`npm view`, `npm list`, `npm outdated`, `npm-check`",
    ours:
      "Any MCP client initialize response, or `strings $(which whatsapp-mcp) | grep 3.0.0` as a crude on-disk probe",
  },
];

const commandMatrixRows: ComparisonRow[] = [
  {
    feature: "npm view whatsapp-mcp-macos version",
    competitor: "1.0.1 (the latest tag on the npm registry)",
    ours:
      "Tells you: what is published. Does not tell you: what you have installed.",
  },
  {
    feature: "npm list -g whatsapp-mcp-macos",
    competitor: "1.1.0 (the package.json shipped in your tarball)",
    ours:
      "Tells you: the identifier inside the file tree on your disk. Does not tell you: what the binary reports.",
  },
  {
    feature: "npm outdated -g whatsapp-mcp-macos",
    competitor: "Current: 1.1.0, Latest: 1.0.1",
    ours:
      "Will show a negative diff when your local is ahead of the registry. Harmless but confusing; the same happens to anyone running an unreleased build from source.",
  },
  {
    feature: "npm-check -g (filtered to this pkg)",
    competitor: "Reports the same numbers as npm outdated, with a prompt",
    ours:
      "Will suggest 'pinning' or 'upgrading' based on package.json diffs. Never surfaces 3.0.0.",
  },
  {
    feature: "MCP initialize handshake",
    competitor: "3.0.0 (the serverInfo.version the server returns)",
    ours:
      "The only version the host and the model will ever see. If you care about runtime behavior, this is the only number that matters.",
  },
];

const metrics = [
  { value: 5, label: "commands claiming to check the version" },
  { value: 3, label: "distinct numbers returned" },
  { value: 1, label: "version the model actually sees" },
  { value: 1115, label: "line of main.swift where it lives" },
];

const recipeSteps = [
  {
    title: "Start with the question, not the command",
    description:
      "Are you asking 'what is on the npm registry?', 'what is installed on my machine?', or 'what is actually running right now?' The answer determines which command you reach for. Generic articles jump straight to `npm view`, which is correct only for the first question.",
  },
  {
    title: "Run the on-disk check",
    description:
      "`npm list -g whatsapp-mcp-macos` for a global install, or `npm ls -g --depth=0 | grep whatsapp` for the short form. This reads the package.json at `$(npm config get prefix)/lib/node_modules/whatsapp-mcp-macos/package.json`. Expect it to sometimes be ahead of the registry if you installed from a branch or a local tarball.",
  },
  {
    title: "Run the registry check, separately",
    description:
      "`npm view whatsapp-mcp-macos version` for the latest dist-tag, or `npm view whatsapp-mcp-macos versions --json` for the full history. This is a network call. Do not assume it matches step 2.",
  },
  {
    title: "Ask the running process",
    description:
      "For an MCP server the host is already holding a handle to it. The `initialize` response contains `serverInfo.version`. In Claude Code, this surfaces in the MCP panel. From raw JSON-RPC, it is in the first response. 3.0.0 for this package, because that string is hardcoded at main.swift:1115.",
  },
  {
    title: "Only now decide whether to 'update'",
    description:
      "If step 2 matches step 3 matches step 4, you are in sync. If any two disagree, you know exactly which layer is drifted and which command to run to fix it. `npm install -g whatsapp-mcp-macos@latest` then a host restart is the usual resolution.",
  },
];

const faqItems = [
  {
    q: "Why does `npm view whatsapp-mcp-macos version` return 1.0.1 when the GitHub repo's package.json says 1.1.0?",
    a: "Because those two files are not the same file. `npm view` queries the npm registry over HTTPS and reads the `dist-tags.latest` entry, which only changes when someone runs `npm publish`. The package.json in the Git repo moves every time a developer bumps the version locally. There is always a window (sometimes hours, sometimes months) where the repo is ahead of the registry. For whatsapp-mcp-macos, the last `npm publish` was 1.0.1 on 2026-03-18; the repo has been at 1.1.0 since. Both numbers are correct for the question they answer; they are answering different questions.",
  },
  {
    q: "What does the `npm-check` tool actually do that plain `npm outdated` does not?",
    a: "The two tools read the same data. `npm outdated` loads every installed package's package.json, compares the version field against the registry's latest dist-tag, and prints a table. `npm-check` does the same read, then wraps an interactive prompt (`npm install -g npm-check` first). Where they differ is ergonomics: `npm-check` filters out unused packages using `require-package-name` heuristics, and it offers an `-u` flag to pick updates interactively. Neither tool reads anything beyond package.json strings, so neither can see a runtime version like `serverInfo.version`.",
  },
  {
    q: "The MCP handshake reports version 3.0.0 but npm says 1.0.1. Which number is the real version?",
    a: "They are both real and they are tracking different things. The npm tag tracks the publish cadence (what was uploaded to registry.npmjs.org, and in what order). The `serverInfo.version` string hardcoded at Sources/WhatsAppMCP/main.swift line 1115 tracks the MCP protocol surface the server exposes to clients. Those two clocks move independently. A routine `npm publish` bumps the first. Editing main.swift and rebuilding bumps the second. If you want to know 'what is the model talking to right now', 3.0.0 is the answer. If you want 'what can I pin in my install script', 1.0.1 is the answer.",
  },
  {
    q: "I ran `npm-check -g` and it said everything is up to date, but the tools in Claude Code behave like an old version. What is going on?",
    a: "`npm-check` is reading file-on-disk state. Claude Code (or any MCP host) keeps a running child process that was spawned from a specific binary at a specific moment. Updating the files on disk does not migrate the running child. The `serverInfo.version` the host sees is whatever was baked into the binary the running process is executing. Two places to look: (1) the host's MCP panel for the live `serverInfo.version`, (2) `ps -p <pid>` for the start time of the child. If start time predates your most recent `npm install`, the host is still running the old child. Restart the host, the host respawns the child, the new version takes effect.",
  },
  {
    q: "Can I bypass npm and just check the version string embedded in the binary?",
    a: "Yes, as a crude probe. `strings $(which whatsapp-mcp) | grep -E '^[0-9]+\\.[0-9]+\\.[0-9]+$'` will scan the Mach-O for version-like constants. For this binary it reports both 3.0.0 (the serverInfo version) and the versions of every bundled Swift dependency (swift-sdk, MacosUseSDK). That is noisy but occasionally useful when you are debugging a binary that was installed by a package manager you do not control, or a binary someone else handed you.",
  },
  {
    q: "Is 3.0.0 the MCP protocol version or the server's own version?",
    a: "It is the server's own version. The MCP protocol version is negotiated separately and lives in the `protocolVersion` field of the initialize response, not in `serverInfo.version`. The MCP Swift SDK fills protocolVersion automatically based on which SDK release is linked. whatsapp-mcp-macos pins modelcontextprotocol/swift-sdk at 0.11.0, which speaks the corresponding MCP spec revision. `serverInfo.version` is a free-form string the server author picks. Here, the author bumped it to 3.0.0 when the tool surface stabilized around 11 tools, independent of npm tags.",
  },
  {
    q: "Why does `npm outdated` sometimes report a 'current' that is higher than 'latest' for this package?",
    a: "That happens when your locally installed package.json version is ahead of what was published. For whatsapp-mcp-macos, anyone running a freshly checked-out clone has `\"version\": \"1.1.0\"` on disk while the registry still shows 1.0.1 as latest. `npm outdated` prints Current: 1.1.0, Wanted: 1.0.1, Latest: 1.0.1. It is not a bug; you are just ahead of the published tag. The same output appears for anyone who installed from a GitHub tarball, a local tgz, or `npm link`.",
  },
  {
    q: "Does `npm-check` respect my `.npmrc` registry settings, or will it always hit registry.npmjs.org?",
    a: "It respects the registry the underlying `npm` client is configured with. Under the hood it shells out to `npm outdated` logic, which reads `registry=` from `.npmrc` (project, user, or global, in that precedence order). If you use a private registry or a proxy, `npm-check` will query the same endpoint. For whatsapp-mcp-macos, which is only published to registry.npmjs.org, point `npm-check` at a proxy and it will 404 on the package lookup.",
  },
  {
    q: "What's the minimum reliable way to answer 'am I running the latest?' for this specific package?",
    a: "Three commands in sequence, and no fewer. (1) `npm view whatsapp-mcp-macos version` → latest published. (2) `npm list -g whatsapp-mcp-macos` → what is on disk. (3) Have the MCP host re-issue `initialize` (usually by restarting the host) → what the binary actually reports. Matching all three is the only signal that 'latest' is a coherent claim. Matching only (1) and (2) leaves you open to the stale-child-process case. Matching only (2) and (3) leaves you open to a newer publish you have not pulled yet.",
  },
  {
    q: "Will `npm-check` ever be able to read the MCP handshake version?",
    a: "Not without a change in scope. `npm-check` is a package-manifest tool; its domain is package.json fields and the registry. Reading an MCP handshake requires spawning the child and speaking JSON-RPC to it, which is outside what a version checker signs up for. The closest generic tool would be an MCP-specific health check that runs `initialize` against every configured server and records `serverInfo.version`. That does not exist as a single command today; hosts like Claude Code surface the data in their MCP panel instead.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "npm-check package version (the three numbers the same install returns)",
    description:
      "Every tool that checks an npm package version, `npm-check`, `npm view`, `npm list -g`, `npm outdated`, answers a different question. For whatsapp-mcp-macos one install returns three numbers: 1.0.1, 1.1.0, and 3.0.0. Worked example showing which command surfaces which number, and which one actually matches what the host is running.",
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

export default function NpmCheckPackageVersionPage() {
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
              npm, the version-layer edition
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              npm-check package version,{" "}
              <GradientText>the three numbers the same install returns</GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-8 max-w-2xl">
              Most write-ups on this topic treat the version of a package as a single
              string. Install{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                npm-check
              </code>
              , run it, pick the upgrade, move on. That is fine when the package is a
              pure-JavaScript library whose only version lives in{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                package.json
              </code>
              . For packages that ship their own runtime, the story splits.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              This page uses{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                whatsapp-mcp-macos
              </code>
              , a Swift-built MCP server distributed over npm, to show why five different
              version-check commands will happily return three different numbers from the
              exact same install, and which one is the only one that tells you what the
              model is actually talking to.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#the-five-commands">
                Jump to the five commands
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
            readingTime="10 min read"
            authorRole="maintainer of whatsapp-mcp-macos"
          />
        </div>
        <ProofBand
          rating={4.8}
          ratingCount="npm + GitHub signals"
          highlights={[
            "Covers the runtime-version layer every version-check tutorial skips",
            "Real numbers from the registry, from the repo, and from main.swift line 1115",
            "Shows exactly which command answers which question, and when they disagree",
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 my-16">
          <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
            <RemotionClip
              title="One install, three version numbers"
              subtitle="why npm-check cannot see the one that matters"
              accent="teal"
              captions={[
                "npm view reports 1.0.1.",
                "npm list -g reports 1.1.0.",
                "The MCP handshake reports 3.0.0.",
                "Each command reads a different file.",
                "Only one is what the model actually sees.",
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Five commands, three answers
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Here are the commands a typical developer reaches for when someone asks,
            &ldquo;what version of this package are we on?&rdquo; Every one of these is in the
            common playbook.{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              npm-check
            </code>{" "}
            in particular is recommended heavily. For a package like this one, none of the
            first four will ever surface the fifth.
          </p>
          <BentoGrid cards={versionCommands} />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <Marquee speed={35}>
            {commandsMarqueeItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-100 text-zinc-800 text-sm font-mono whitespace-nowrap border border-zinc-200"
              >
                {item}
              </span>
            ))}
          </Marquee>
          <p className="text-sm text-zinc-500 text-center -mt-2">
            The common advice fleet. Every one of these reads package.json or the registry.
            Exactly one of them reaches the running process, and it is not in the list.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <AnimatedBeam
            title="what each channel is actually reading"
            from={beamFrom}
            hub={beamHub}
            to={beamTo}
          />
          <p className="text-sm text-zinc-500 mt-4 text-center max-w-2xl mx-auto">
            Three channels, three storage locations, three version strings. A version
            check is really a triplet, not a scalar, and only one of the three lives
            inside the compiled binary.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <MetricsRow metrics={metrics} />
          <p className="text-sm text-zinc-500 text-center mt-4 max-w-2xl mx-auto">
            Four numbers that describe this specific install, pulled from a live registry
            query, a local{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              cat package.json
            </code>
            , and a{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              grep version Sources/WhatsAppMCP/main.swift
            </code>
            .
          </p>
        </section>

        <GlowCard className="max-w-4xl mx-auto my-16">
          <div className="p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-3">
              anchor fact
            </p>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">
              The runtime version lives on line{" "}
              <NumberTicker value={1115} /> of main.swift
            </h3>
            <p className="text-zinc-600 leading-relaxed mb-6">
              The version string that actually reaches the model is a hardcoded constant
              at{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                Sources/WhatsAppMCP/main.swift:1115
              </code>
              . Today it reads{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                version: &quot;3.0.0&quot;
              </code>
              . That string is handed to the MCP{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                Server
              </code>{" "}
              constructor from the Swift SDK, which echoes it back to every client as
              part of the{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                initialize
              </code>{" "}
              response, under{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                serverInfo.version
              </code>
              .
            </p>
            <p className="text-zinc-600 leading-relaxed">
              The last{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                npm publish
              </code>{" "}
              pushed{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                1.0.1
              </code>{" "}
              on 2026-03-18. The current repo has{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                &quot;version&quot;: &quot;1.1.0&quot;
              </code>{" "}
              in package.json. Neither of those has any effect on the string on line
              1115. Three numbers. Three clocks. One package.
            </p>
          </div>
        </GlowCard>

        <section className="max-w-4xl mx-auto px-6 my-16" id="the-five-commands">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The hardcoded line that no `npm-check` can see
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            This is the actual declaration that produces the runtime version. It is in
            the source tree, and it is compiled into every release binary. Nothing in the
            npm CLI ever reads it.
          </p>
          <AnimatedCodeBlock
            code={serverSwiftCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The package.json the on-disk commands read
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            When{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              npm list -g
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              npm outdated
            </code>
            , or{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              npm-check
            </code>{" "}
            want a version string for this package, they load this file from
            your global prefix. The field they care about is on line 3.
          </p>
          <AnimatedCodeBlock
            code={packageJsonCode}
            language="json"
            filename="lib/node_modules/whatsapp-mcp-macos/package.json"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The registry document `npm view` reads
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            And this is the registry response that{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              npm view whatsapp-mcp-macos version
            </code>{" "}
            distills into a single string. Note the dist-tag. That is a pointer
            maintained by whoever last ran{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              npm publish
            </code>
            , nothing more.
          </p>
          <AnimatedCodeBlock
            code={npmRegistryCode}
            language="json"
            filename="GET https://registry.npmjs.org/whatsapp-mcp-macos"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What the five commands actually print
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Same machine, same install, five queries, in order. Read to the end and note
            that the last one is the only one that speaks to the live process.
          </p>
          <TerminalOutput
            title="version check, five ways"
            lines={[
              { type: "command", text: "npm view whatsapp-mcp-macos version" },
              { type: "output", text: "1.0.1" },
              { type: "command", text: "npm list -g whatsapp-mcp-macos" },
              {
                type: "output",
                text: "/Users/you/.nvm/versions/node/v20.11.1/lib",
              },
              {
                type: "output",
                text: "└── whatsapp-mcp-macos@1.1.0",
              },
              { type: "command", text: "npm outdated -g whatsapp-mcp-macos" },
              {
                type: "output",
                text: "Package             Current  Wanted  Latest",
              },
              {
                type: "output",
                text: "whatsapp-mcp-macos  1.1.0    1.0.1   1.0.1",
              },
              { type: "command", text: "npm-check -g -u | grep whatsapp" },
              {
                type: "output",
                text: "  ● whatsapp-mcp-macos   1.1.0  (installed)  1.0.1  (latest)",
              },
              {
                type: "command",
                text: "# now ask the running MCP child (via Claude Code's panel, or raw JSON-RPC):",
              },
              {
                type: "output",
                text: '{ "serverInfo": { "name": "WhatsAppMCP", "version": "3.0.0" } }',
              },
              { type: "success", text: "five commands. three distinct numbers." },
            ]}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Where the number actually comes from, per command
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            If you only read one table on this page, read this one. &ldquo;Returns&rdquo; is the
            literal string each command prints for a reference install. &ldquo;Notes&rdquo; is what
            that string is useful for, and where it will mislead you.
          </p>
          <ComparisonTable
            productName="What the command actually tells you"
            competitorName="Returns, on a reference install"
            rows={commandMatrixRows}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            How the runtime version actually reaches a client
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Since no npm command surfaces the 3.0.0, it is worth seeing exactly how the
            handshake that does surface it travels. This is the sequence between a host
            (Claude Code, Cursor, any MCP client) and a freshly spawned whatsapp-mcp-macos
            child.
          </p>
          <SequenceDiagram
            title="MCP initialize, the only channel that returns serverInfo.version"
            actors={["Host", "MCP child", "main.swift"]}
            messages={[
              { from: 0, to: 1, label: "spawn whatsapp-mcp (stdio)", type: "request" },
              { from: 1, to: 2, label: "Server(name, version: \"3.0.0\", ...)", type: "request" },
              { from: 0, to: 1, label: '{"method":"initialize","params":{...}}', type: "request" },
              {
                from: 1,
                to: 0,
                label: '{"result":{"serverInfo":{"name":"WhatsAppMCP","version":"3.0.0"},...}}',
                type: "response",
              },
              { from: 0, to: 1, label: "tool calls proceed", type: "event" },
            ]}
          />
          <p className="text-sm text-zinc-500 mt-4 max-w-3xl mx-auto">
            The version string is handed to the SDK{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              Server
            </code>{" "}
            constructor exactly once at process start, captured in its internal state, and
            echoed back at every initialize. No npm query ever touches this path.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 text-center">
            Manifest-level version vs. runtime-level version
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed text-center max-w-2xl mx-auto">
            Lining them up makes it obvious why a single-number check is the wrong shape
            of question.
          </p>
          <ComparisonTable
            productName="runtime-level version (serverInfo.version)"
            competitorName="manifest-level version (package.json)"
            rows={commandComparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The reliable version-check recipe
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            If you care about this for a real reason, say you are debugging why a tool is
            behaving oddly, or your release notes claim a new tool exists and it is not
            showing up, this is the order that gives you a coherent answer.
          </p>
          <StepTimeline steps={recipeSteps} />
        </section>

        <BookCallCTA
          appearance="footer"
          destination={BOOKING_URL}
          site="WhatsApp MCP"
          heading="Running into a version mismatch you cannot explain?"
          description="Show me the three numbers and we will work out which clock is stuck. Fifteen minutes, live over Zoom."
        />

        <FaqSection items={faqItems} />

        <BookCallCTA
          appearance="sticky"
          destination={BOOKING_URL}
          site="WhatsApp MCP"
          description="Stuck on a version mismatch? Book 15 minutes and we will debug it live."
        />
      </article>
    </>
  );
}
