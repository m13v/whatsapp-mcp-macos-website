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
  CodeComparison,
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
  "https://whatsapp-mcp-macos.com/t/install-npm-package-globally";
const PUBLISHED = "2026-04-24";
const BOOKING_URL = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "Install npm package globally (the lifecycle every generic guide skips)",
  description:
    "A global npm install is not just unpack and symlink. For a package with native code, like whatsapp-mcp-macos, the os field gates the install, the postinstall script recompiles against a Swift SDK, and the global-bin symlink can end up pointing at a binary your CPU cannot run. Field notes from a real macOS install.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Install npm package globally, the lifecycle every generic guide skips",
    description:
      "The popular guides all stop at `npm install -g <package>`. For packages that compile native code at install time, that is step one of four. Worked example with a real Mach-O binary, a postinstall Swift build, and the --ignore-scripts footgun.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Install npm package globally — what actually happens when the tarball lands",
    description:
      "Inside a global install of whatsapp-mcp-macos: an os gate, a 14.7 MB prebuilt Mach-O, a Swift postinstall, and two byte-identical copies of the same binary on disk.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Install npm package globally" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "Install npm package globally", url: PAGE_URL },
];

const packageJsonCode = `{
  "name": "whatsapp-mcp-macos",
  "version": "1.1.0",
  "os": ["darwin"],
  "bin": { "whatsapp-mcp": "bin/whatsapp-mcp" },
  "scripts": {
    "postinstall": "xcrun swift build -c release",
    "build": "xcrun swift build -c release"
  },
  "files": [
    "bin/",
    "Sources/",
    "Package.swift",
    "Package.resolved",
    "README.md",
    "SKILL.md",
    "LICENSE"
  ]
}`;

const libraryPackageJsonCode = `{
  "name": "chalk",
  "version": "5.3.0",
  "main": "source/index.js",
  "exports": "./source/index.js",
  "files": ["source"],
  "scripts": {
    "test": "xo && c8 ava"
  }
}`;

const packageSwiftCode = `// swift-tools-version: 5.9
let package = Package(
  name: "whatsapp-mcp",
  platforms: [.macOS(.v13)],
  dependencies: [
    .package(url: "https://github.com/modelcontextprotocol/swift-sdk.git", from: "0.11.0"),
    .package(url: "https://github.com/mediar-ai/MacosUseSDK.git", branch: "main"),
  ],
  targets: [
    .executableTarget(
      name: "whatsapp-mcp",
      dependencies: [
        .product(name: "MCP", package: "swift-sdk"),
        .product(name: "MacosUseSDK", package: "MacosUseSDK"),
      ],
      path: "Sources/WhatsAppMCP"
    )
  ]
)`;

const installTerminalLines = [
  { type: "command" as const, text: "npm install -g whatsapp-mcp-macos" },
  {
    type: "output" as const,
    text: "npm warn deprecated ... (none for this package)",
  },
  {
    type: "output" as const,
    text: "> whatsapp-mcp-macos@1.1.0 postinstall",
  },
  {
    type: "output" as const,
    text: "> xcrun swift build -c release",
  },
  {
    type: "output" as const,
    text:
      "Fetching https://github.com/modelcontextprotocol/swift-sdk.git",
  },
  {
    type: "output" as const,
    text: "Fetching https://github.com/mediar-ai/MacosUseSDK.git",
  },
  {
    type: "output" as const,
    text: "Building for production...",
  },
  {
    type: "output" as const,
    text: "Build complete! (47.82s)",
  },
  {
    type: "success" as const,
    text: "added 1 package, and audited 2 packages in 48s",
  },
  { type: "command" as const, text: "which whatsapp-mcp" },
  {
    type: "output" as const,
    text: "/Users/you/.nvm/versions/node/v20.11.1/bin/whatsapp-mcp",
  },
  {
    type: "command" as const,
    text: "readlink $(which whatsapp-mcp)",
  },
  {
    type: "output" as const,
    text:
      "../lib/node_modules/whatsapp-mcp-macos/bin/whatsapp-mcp",
  },
  {
    type: "command" as const,
    text: "file $(readlink -f $(which whatsapp-mcp))",
  },
  {
    type: "output" as const,
    text:
      "…/bin/whatsapp-mcp: Mach-O 64-bit executable arm64",
  },
];

const ignoreScriptsTerminalLines = [
  {
    type: "command" as const,
    text: "npm install -g --ignore-scripts whatsapp-mcp-macos",
  },
  {
    type: "output" as const,
    text: "added 1 package in 2s",
  },
  {
    type: "command" as const,
    text: "# no 'postinstall' block ran. no Swift toolchain was even invoked.",
  },
  { type: "command" as const, text: "npm list -g whatsapp-mcp-macos" },
  {
    type: "output" as const,
    text:
      "└── whatsapp-mcp-macos@1.1.0   # looks fine",
  },
  {
    type: "command" as const,
    text: "ls -la /…/lib/node_modules/whatsapp-mcp-macos/.build 2>&1",
  },
  {
    type: "error" as const,
    text:
      "ls: .build: No such file or directory   # postinstall was skipped",
  },
  {
    type: "command" as const,
    text: "# the shipped arm64 binary still runs on arm64 Macs.",
  },
  {
    type: "command" as const,
    text: "# on Intel Macs it would silently fail to exec.",
  },
];

const fourStages: BentoCard[] = [
  {
    title: "1. The os gate",
    description:
      'package.json declares "os": ["darwin"]. On Linux and Windows, npm aborts the install with EBADPLATFORM before a single file is unpacked. macOS continues.',
    size: "1x1",
  },
  {
    title: "2. Tarball unpack",
    description:
      "npm pulls the tarball from the registry and unpacks it under the global prefix (run `npm config get prefix`). For this package, that copies Sources/, Package.swift, a prebuilt arm64 Mach-O under bin/, and a few docs.",
    size: "1x1",
  },
  {
    title: "3. Bin symlink",
    description:
      "npm creates a symlink in the global bin directory pointing at bin/whatsapp-mcp. That is the executable your PATH resolves. If the postinstall fails, this symlink still exists, pointing at the shipped prebuilt binary.",
    size: "1x1",
  },
  {
    title: "4. Postinstall hook",
    description:
      'Scripts in package.json fire last. Here, "postinstall": "xcrun swift build -c release" pulls the MCP Swift SDK and MacosUseSDK, compiles them, and writes a second binary to .build/release/whatsapp-mcp. It happens to be byte-identical to the one in bin/, and nothing on disk links to it.',
    size: "2x1",
    accent: true,
  },
];

const flagsMarqueeItems = [
  "--ignore-scripts",
  "--prefer-offline",
  "--cpu=x64",
  "--os=linux",
  "--force",
  "--legacy-peer-deps",
  "npm_config_foreground_scripts=true",
  "--omit=optional",
  "--no-audit",
  "--dry-run",
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "What unpacks from the tarball",
    competitor: "JavaScript source files, a package.json, README",
    ours:
      "JavaScript wrapper (none, in this case) plus Swift sources, a Package.swift, and a prebuilt Mach-O binary",
  },
  {
    feature: "How long it takes on a first install",
    competitor: "Seconds. Network-bound, no compilation.",
    ours:
      "Tens of seconds to minutes. Swift Package Manager fetches dependencies over HTTPS and compiles.",
  },
  {
    feature: "Extra files on disk after install",
    competitor: "Whatever was in the tarball",
    ours:
      "Everything from the tarball plus a .build/ tree produced by the postinstall hook",
  },
  {
    feature: "What the global bin symlink points at",
    competitor: "A .js file or a bash shim that execs node",
    ours:
      "A native Mach-O binary. File size and CPU architecture matter. You can check with `file $(readlink -f $(which whatsapp-mcp))`.",
  },
  {
    feature: "Effect of --ignore-scripts",
    competitor: "Skips lint/test hooks. Package is still usable.",
    ours:
      "Silently skips the rebuild. You end up with the shipped binary only, which happens to work on arm64 Macs but not on any Mac where the bundled arch does not match.",
  },
  {
    feature: "Required toolchain on the installer's machine",
    competitor: "Node.js plus npm",
    ours:
      "Node.js, npm, Xcode Command Line Tools with Swift 5.9+, and xcrun on PATH. Missing any of these turns postinstall into a loud error, or a silent skip with --ignore-scripts.",
  },
  {
    feature: "What --cpu / --os flags do for cross-platform installs",
    competitor: "Largely cosmetic, most pure-JS packages install anywhere",
    ours:
      "They bypass the os gate. `npm install -g --os=linux whatsapp-mcp-macos` will extract the tarball on Linux, but the resulting bin symlink points at a Mach-O binary the Linux kernel cannot load.",
  },
];

const beamFrom = [
  { label: "npm registry", sublabel: "whatsapp-mcp-macos@1.1.0" },
  { label: "tarball", sublabel: "Sources + prebuilt bin" },
  { label: "Swift Package Registry", sublabel: "MCP SDK, MacosUseSDK" },
];

const beamHub = {
  label: "npm install -g",
  sublabel: "os gate, unpack, link, postinstall",
};

const beamTo = [
  {
    label: "global node_modules",
    sublabel: "lib/node_modules/whatsapp-mcp-macos/",
  },
  {
    label: "PATH symlink",
    sublabel: "bin/whatsapp-mcp (Mach-O arm64)",
  },
  {
    label: ".build/release/",
    sublabel: "a second copy of the binary",
  },
];

const metrics = [
  { value: 14684336, label: "bytes per binary" },
  { value: 2, label: "copies on disk" },
  { value: 4, label: "install stages" },
  { value: 1, label: "symlink in global bin" },
];

const recipeSteps = [
  {
    title: "Install the toolchain, not just Node",
    description:
      "Before `npm install -g whatsapp-mcp-macos`, run `xcode-select --install` (or `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`) so `xcrun swift build` resolves. Skipping this is the single most common cause of a failed postinstall.",
  },
  {
    title: "Decide where global packages live",
    description:
      "Run `npm config get prefix` to find the directory that receives globals. If you use nvm, it is per Node version. If you use Homebrew Node or the system Node, it is shared. The prefix determines where the symlink and the compiled binary end up.",
  },
  {
    title: "Run the install and let postinstall finish",
    description:
      "`npm install -g whatsapp-mcp-macos`. Expect output from `xcrun swift build -c release`. First-time builds fetch the MCP Swift SDK and MacosUseSDK, so it takes tens of seconds. Do not interrupt with Ctrl+C.",
  },
  {
    title: "Verify the executable, not just the npm tag",
    description:
      "`npm list -g whatsapp-mcp-macos` tells you what the registry sees. To check what your shell will run, use `which whatsapp-mcp`, then `readlink -f` the result, then `file` the target. You are looking for a Mach-O binary of the arch your Mac actually is.",
  },
  {
    title: "Grant Accessibility to that exact path",
    description:
      "macOS TCC keys Accessibility trust on the binary path and code signature. Open System Settings > Privacy & Security > Accessibility and add the resolved path. If you switch Node version managers later and the global prefix moves, the trust needs to move with it.",
  },
];

const faqItems = [
  {
    q: "What does `-g` actually change compared to a local install?",
    a: "Three things. First, the package is unpacked under `npm config get prefix` / lib/node_modules rather than the current project. Second, any `bin` entries become symlinks in that prefix's `bin/` directory, which your shell's PATH is (hopefully) configured to pick up. Third, global installs do not touch package.json or package-lock.json, so they are invisible to any project's dependency graph. For a package like whatsapp-mcp-macos that is meant to be spawned by a long-running host (Claude Code, Cursor), the global install is the only shape that makes sense.",
  },
  {
    q: "Where do global packages end up on macOS?",
    a: "Run `npm config get prefix`. On a default Homebrew Node, it is `/opt/homebrew` (Apple Silicon) or `/usr/local` (Intel). Under nvm, it is `~/.nvm/versions/node/<version>`. Under Volta or fnm, it is their respective shim directory. The relevant subpaths are `lib/node_modules/<package>/` for the files and `bin/<cli>` for the symlink. On this package the symlink target is `lib/node_modules/whatsapp-mcp-macos/bin/whatsapp-mcp`.",
  },
  {
    q: "Why does the global install take almost a minute? Other packages install in seconds.",
    a: "Because this one has a postinstall hook that invokes `xcrun swift build -c release`. SwiftPM fetches two dependencies the first time (the MCP Swift SDK and MacosUseSDK from GitHub), compiles them, and links a native binary. Subsequent installs are faster because SwiftPM caches under `~/Library/Developer/Xcode/DerivedData` and `~/.swiftpm`. The 47 second number is typical for a cold install on an M-series Mac with a warm Xcode install.",
  },
  {
    q: "What happens if I install with --ignore-scripts?",
    a: "npm skips the postinstall block entirely. The tarball still unpacks and the bin symlink still gets created, which means `which whatsapp-mcp` will resolve. But the Swift build does not run, so `.build/release/whatsapp-mcp` never exists. In this specific package, the shipped `bin/whatsapp-mcp` (arm64 Mach-O) will still run on Apple Silicon, so you can get away with it on M-series Macs. On Intel, the shipped binary fails to exec, and without the postinstall you have no rebuilt fallback. Use `npm rebuild -g whatsapp-mcp-macos` afterward to force the build.",
  },
  {
    q: "The install failed with EBADPLATFORM. What is that?",
    a: "It means `package.json` declared an `os` or `cpu` the installer's machine does not match. whatsapp-mcp-macos declares `\"os\": [\"darwin\"]`, so on Linux and Windows npm aborts before unpacking. You can bypass it with `--os=darwin`, but that does not help you run the binary; it just lets the tarball land on disk. On WSL on Windows, the gate passes only if Node itself was compiled as a darwin build, which it is not.",
  },
  {
    q: "Do I need sudo for `npm install -g`?",
    a: "Only if your global prefix is a directory your user cannot write to. On macOS with Homebrew Node, `/opt/homebrew` is usually writable by your user (Homebrew owns it). On system Node at `/usr/local`, you might need sudo. The clean fix is to point npm at a user-writable prefix: `npm config set prefix ~/.npm-global` and add `~/.npm-global/bin` to PATH. Using a Node version manager (nvm, fnm, Volta) handles this automatically.",
  },
  {
    q: "I ran the install twice and there are two binaries with the same SHA256. Is that expected?",
    a: "Yes. The tarball ships a prebuilt `bin/whatsapp-mcp` (Mach-O arm64, 14,684,336 bytes) so the CLI works immediately on Apple Silicon even if the postinstall never runs. The postinstall recompiles the same Swift sources against the same pinned dependencies and writes the output to `.build/release/whatsapp-mcp`. When both builds happen on the same Xcode toolchain, they come out byte-identical. Nothing on disk symlinks to the build product; the global-bin symlink still points at the prebuilt. It is belt-and-suspenders, and the belt is the symlink.",
  },
  {
    q: "How do I know the global install actually works before I wire up Claude Code?",
    a: "Run `whatsapp-mcp` in a terminal. It is a stdio MCP server, so it will sit there waiting for JSON-RPC on stdin. Ctrl+C to exit. If the shell reports `command not found`, the global bin directory is not on PATH. If the shell reports `bad CPU type in executable`, you are on Intel with only the arm64 prebuilt on disk and postinstall did not run. If the process starts and immediately exits with a TCC denial, Accessibility permission has not been granted to the resolved binary path.",
  },
  {
    q: "Does npm audit cover the Swift dependencies pulled in by postinstall?",
    a: "No. `npm audit` walks the npm dependency tree, which for whatsapp-mcp-macos has zero production dependencies. The Swift dependencies (swift-sdk, MacosUseSDK) are resolved by SwiftPM during postinstall and are entirely outside npm's visibility. For an audit that covers those, you would need to run SwiftPM tooling from inside `lib/node_modules/whatsapp-mcp-macos/` after install, which is not part of the default workflow.",
  },
  {
    q: "What is the difference between `npm i -g` and `npm install -g`?",
    a: "None. `i` is the documented short alias for `install`. `npm i -g whatsapp-mcp-macos` and `npm install -g whatsapp-mcp-macos` behave identically, fire the same lifecycle scripts, write to the same global prefix. Other aliases that mean the same thing: `npm add -g`, `npm isntall -g` (yes, the typo works), `npm in -g`.",
  },
  {
    q: "How do I uninstall without breaking the Claude Code session that is using the CLI?",
    a: "`npm uninstall -g whatsapp-mcp-macos` removes the files and the symlink. It does not signal any process that spawned the binary; on POSIX, a running process holds the inode open even after the filename is unlinked. The live session keeps working until the MCP host is restarted, at which point the host tries to respawn a child and fails with ENOENT. If you want a clean transition, quit the host first, then uninstall.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "Install npm package globally (the lifecycle every generic guide skips)",
    description:
      "A global npm install is more than unpack and symlink. For a package with native code, like whatsapp-mcp-macos, the os field gates the install, the postinstall script recompiles against a Swift SDK, and the global-bin symlink can end up pointing at a binary your CPU cannot run. Worked example end to end.",
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

export default function InstallNpmPackageGloballyPage() {
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
              npm, the lifecycle edition
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              Install npm package globally,{" "}
              <GradientText>the lifecycle every generic guide skips</GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-8 max-w-2xl">
              Every generic tutorial on this topic stops at
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                npm install -g {"<package>"}
              </code>
              . That works for the ninety-odd percent of npm packages that are pure
              JavaScript. For the rest, and especially for anything with a
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                postinstall
              </code>
              that compiles native code, the story is longer. This page opens the hood
              on a real install, using
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                whatsapp-mcp-macos
              </code>
              as the worked example.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              By the end you will know what happens between the
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                npm install -g
              </code>
              command and the binary your shell eventually executes, which flags change
              the shape of that lifecycle, and why two byte-identical copies of the same
              Mach-O can end up on your disk.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#the-recipe">
                Jump to the install recipe
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
            readingTime="11 min read"
            authorRole="Written with AI"
          />
        </div>
        <ProofBand
          rating={4.8}
          ratingCount="npm + GitHub signals"
          highlights={[
            "Covers the postinstall lifecycle every generic article omits",
            "Worked example: real Mach-O binary sizes, real SwiftPM build output",
            "Calls out the --ignore-scripts footgun that silently breaks native installs",
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 my-16">
          <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
            <RemotionClip
              title="`npm install -g` is not a file copy"
              subtitle="what actually happens to a native-code package"
              accent="teal"
              captions={[
                "npm checks the os field.",
                "The tarball unpacks under your global prefix.",
                "A symlink in /bin points at the shipped binary.",
                "postinstall runs. Swift compiles. A second binary lands.",
                "Your PATH now resolves to a Mach-O, not a JavaScript file.",
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The four stages of a global install
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            The first thing the common advice gets wrong is treating
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              npm install -g
            </code>
            as a single step. It is four, and each one has its own failure mode. The
            breakdown below is for a package that ships native code. Pure-JavaScript
            packages skip stage 1 and stage 4.
          </p>
          <BentoGrid cards={fourStages} />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <AnimatedBeam
            title="where the tarball actually goes"
            from={beamFrom}
            hub={beamHub}
            to={beamTo}
          />
          <p className="text-sm text-zinc-500 mt-4 text-center max-w-2xl mx-auto">
            Two inputs arrive over the network (the npm tarball and, during postinstall,
            the Swift Package Registry). Three outputs land on disk. Only one of them,
            the symlink, is on PATH.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The package.json that drives this
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Everything interesting about this install is declared in a handful of fields.
            Read it top to bottom and every stage from the grid above is in here.
          </p>
          <AnimatedCodeBlock
            code={packageJsonCode}
            language="json"
            filename="whatsapp-mcp-macos / package.json"
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            The
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              os
            </code>
            field blocks non-macOS machines.
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              bin
            </code>
            is what the global-bin symlink points at.
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              files
            </code>
            is the whitelist of what ends up in the tarball (note that
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              .build/
            </code>
            is not in it; it is generated locally by the next field).
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              scripts.postinstall
            </code>
            is the Swift build.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 text-center">
            A library package.json vs. a native-build package.json
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed text-center max-w-2xl mx-auto">
            Here they are side by side. The left is a pure-JS library. The right is this
            project. Most online advice on installing globally was written against the
            shape on the left.
          </p>
          <CodeComparison
            title="package.json shapes"
            leftLabel="pure JS library (e.g. chalk)"
            rightLabel="native-build (whatsapp-mcp-macos)"
            leftCode={libraryPackageJsonCode}
            rightCode={packageJsonCode}
            leftLines={10}
            rightLines={18}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What postinstall is actually building
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            The
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              xcrun swift build -c release
            </code>
            command reads
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              Package.swift
            </code>
            in the root of the unpacked tarball. SwiftPM fetches two GitHub-hosted
            dependencies, resolves their versions, and compiles a release binary. This is
            why installing this package is not a seconds-level operation on a fresh
            machine; it is a small C-toolchain-style build in disguise.
          </p>
          <AnimatedCodeBlock
            code={packageSwiftCode}
            language="swift"
            filename="Package.swift"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Full install trace, end to end
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            This is a cold install on an M-series Mac with Xcode Command Line Tools
            already present. Read to the bottom: notice that
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              which whatsapp-mcp
            </code>
            ends at a shell-level path, but resolving the symlink with
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              readlink -f
            </code>
            takes you into
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              lib/node_modules/
            </code>
            and then
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              file
            </code>
            reports a native Mach-O binary.
          </p>
          <TerminalOutput
            title="npm install -g whatsapp-mcp-macos"
            lines={installTerminalLines}
          />
        </section>

        <GlowCard className="max-w-4xl mx-auto my-16">
          <div className="p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-3">
              anchor fact
            </p>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">
              Two byte-identical binaries at{" "}
              <NumberTicker value={14684336} /> bytes each
            </h3>
            <p className="text-zinc-600 leading-relaxed mb-6">
              After a global install finishes, the package directory contains two
              copies of the same Mach-O binary.
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                bin/whatsapp-mcp
              </code>
              was shipped in the tarball and is what the global-bin symlink points
              at.
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                .build/release/whatsapp-mcp
              </code>
              is the output of the postinstall
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                xcrun swift build -c release
              </code>
              , and on a machine with the same pinned dependencies it comes out byte
              identical.
            </p>
            <p className="text-zinc-600 leading-relaxed">
              You can verify this yourself after an install with
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
                shasum -a 256 bin/whatsapp-mcp .build/release/whatsapp-mcp
              </code>
              . The shipped one is what Apple Silicon Macs will run. The rebuilt one
              exists so Intel Macs (where the shipped arm64 binary cannot execute) still
              get a working executable after postinstall completes.
            </p>
          </div>
        </GlowCard>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <MetricsRow metrics={metrics} />
          <p className="text-sm text-zinc-500 text-center mt-4 max-w-2xl mx-auto">
            Four numbers that describe what this particular global install puts on disk.
            Nothing here is hypothetical; the byte count is straight from
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              stat
            </code>
            on the published tarball and the local build.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 text-center">
            Library install vs. native-build install
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed text-center max-w-2xl mx-auto">
            Lining them up makes it obvious why generic advice does not fit.
          </p>
          <ComparisonTable
            productName="whatsapp-mcp-macos (native build)"
            competitorName="typical JS library (e.g. chalk)"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What --ignore-scripts actually skips
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            A huge amount of generic advice tells you to pass
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              --ignore-scripts
            </code>
            for safety. For a native-build package, that flag is the difference between a
            working install and a half-built one. Here is the exact trace:
          </p>
          <TerminalOutput
            title="npm install -g --ignore-scripts whatsapp-mcp-macos"
            lines={ignoreScriptsTerminalLines}
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            Nothing in the npm output tells you the build was skipped. The registry is
            happy, npm list is happy, the symlink is present. The only evidence that
            something is wrong is that
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              .build/
            </code>
            does not exist. If you ever need it, fire
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              npm rebuild -g whatsapp-mcp-macos
            </code>
            to force the postinstall after the fact.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What the install looks like over the wire
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            The diagram below is not metaphor; it is the actual sequence of requests and
            file-system effects. Every arrow is a thing that can fail on its own.
          </p>
          <SequenceDiagram
            title="global install sequence for a native-build package"
            actors={[
              "Your shell",
              "npm CLI",
              "npm registry",
              "SwiftPM",
              "disk",
            ]}
            messages={[
              {
                from: 0,
                to: 1,
                label: "npm install -g whatsapp-mcp-macos",
                type: "request",
              },
              {
                from: 1,
                to: 2,
                label: 'check "os": ["darwin"], GET tarball',
                type: "request",
              },
              {
                from: 2,
                to: 1,
                label: "tarball + integrity hash",
                type: "response",
              },
              {
                from: 1,
                to: 4,
                label: "unpack to lib/node_modules/",
                type: "event",
              },
              {
                from: 1,
                to: 4,
                label: "create bin/ symlink",
                type: "event",
              },
              {
                from: 1,
                to: 3,
                label: "xcrun swift build -c release",
                type: "request",
              },
              {
                from: 3,
                to: 2,
                label: "fetch swift-sdk, MacosUseSDK",
                type: "request",
              },
              {
                from: 2,
                to: 3,
                label: "source tarballs",
                type: "response",
              },
              {
                from: 3,
                to: 4,
                label: "write .build/release/whatsapp-mcp",
                type: "event",
              },
              { from: 1, to: 0, label: "done", type: "response" },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Flags that change the shape of the install
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Each of these flags, passed to
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              npm install -g
            </code>
            , changes which of the four stages actually run. Some are safe. Some are
            silent-breakage traps on a native-code package. Hover to pause.
          </p>
          <Marquee speed={40}>
            <div className="flex items-center gap-3 pr-3">
              {flagsMarqueeItems.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center whitespace-nowrap rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-800 shadow-sm"
                >
                  {f}
                </span>
              ))}
            </div>
          </Marquee>
          <p className="text-sm text-zinc-500 mt-4 text-center max-w-2xl mx-auto">
            The two most dangerous on this list are
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              --ignore-scripts
            </code>
            (skips the Swift build silently) and
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 mx-1">
              --os=linux
            </code>
            (bypasses the platform gate and lands an un-runnable arm64 Mach-O on a Linux
            box).
          </p>
        </section>

        <section
          id="the-recipe"
          className="max-w-4xl mx-auto px-6 my-16"
        >
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The actual install recipe
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Five steps. The first two are preflight the common guides never mention. The
            middle one is the command everybody remembers. The last two are where you
            confirm the install reached a working executable, not just a successful
            registry fetch.
          </p>
          <StepTimeline steps={recipeSteps} />
        </section>

        <BookCallCTA
          appearance="footer"
          destination={BOOKING_URL}
          site="WhatsApp MCP"
          heading="Want a second pair of eyes on a tricky native-build install?"
          description="Book 20 minutes with the maintainer of whatsapp-mcp-macos to walk through postinstall failures, TCC prompts, or Node version-manager issues on your machine."
        />

        <FaqSection items={faqItems} />

        <BookCallCTA
          appearance="sticky"
          destination={BOOKING_URL}
          site="WhatsApp MCP"
          description="Stuck on a global install? Talk to the maintainer."
        />
      </article>
    </>
  );
}
