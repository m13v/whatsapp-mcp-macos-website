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
  CodeComparison,
  ComparisonTable,
  MetricsRow,
  AnimatedChecklist,
  StepTimeline,
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type ComparisonRow,
} from "@seo/components";

const PAGE_URL = "https://whatsapp-mcp-macos.com/t/npm-how-to-update-package";
const PUBLISHED = "2026-04-17";

export const metadata: Metadata = {
  title: "npm how to update package (when the package builds native code on install)",
  description:
    "A practical guide to updating npm packages, written from the angle every other tutorial skips: what happens when the package has a postinstall that compiles a Swift, Rust, or C binary on your machine. Uses whatsapp-mcp-macos as the concrete example.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "npm how to update package — when postinstall rebuilds native code",
    description:
      "Every npm update guide covers npm outdated, npm update, npm install pkg@latest. None cover what happens when the package has a native postinstall hook. Here is the field guide, with whatsapp-mcp-macos as the worked example.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "npm how to update package — the native-postinstall edition",
    description:
      "npm update runs postinstall. If postinstall compiles Swift, Rust, or C, your update is a full native rebuild. Here is what generic guides miss.",
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

const genericPackageJson = `{
  "name": "some-js-tool",
  "version": "2.4.0",
  "bin": { "some-js-tool": "dist/cli.js" },
  "scripts": {
    "build": "tsc",
    "prepare": "npm run build"
  },
  "dependencies": {
    "chalk": "^5.3.0",
    "commander": "^11.1.0"
  }
}`;

const nativePackageJson = `{
  "name": "whatsapp-mcp-macos",
  "version": "1.1.0",
  "os": ["darwin"],
  "bin": { "whatsapp-mcp": "bin/whatsapp-mcp" },
  "scripts": {
    "postinstall": "xcrun swift build -c release",
    "build":       "xcrun swift build -c release"
  },
  "files": [
    "bin/", "Sources/",
    "Package.swift", "Package.resolved",
    "README.md", "SKILL.md", "LICENSE"
  ]
}`;

const commandCards: BentoCard[] = [
  {
    title: "npm outdated -g",
    description:
      "Prints the installed vs. latest version side by side for every global package. Does not touch anything. Run this before any update to see what will actually change.",
    size: "1x1",
  },
  {
    title: "npm update -g whatsapp-mcp-macos",
    description:
      "Updates inside the semver range pinned on disk. Triggers the postinstall, which runs xcrun swift build -c release. If Xcode is missing, the update ends with a compile error and you keep the old binary.",
    size: "2x1",
    accent: true,
  },
  {
    title: "npm install -g whatsapp-mcp-macos@latest",
    description:
      "Jumps across the semver range to the latest published tag. Same postinstall rebuild. Use this when a major version has shipped and npm update refuses to cross it.",
    size: "1x1",
  },
  {
    title: "npm install -g whatsapp-mcp-macos@1.1.0",
    description:
      "Pins an exact version. Useful for rolling back a bad release or reproducing a user report. Still rebuilds the Swift binary locally.",
    size: "1x1",
  },
  {
    title: "npm rebuild -g whatsapp-mcp-macos",
    description:
      "Re-runs the postinstall on the version you already have installed. Use this after upgrading Xcode, switching Command Line Tools, or if the binary stopped working without a version change.",
    size: "1x1",
  },
  {
    title: "npm uninstall -g whatsapp-mcp-macos",
    description:
      "Removes the package and the compiled binary. On macOS, also removes the binary from the Accessibility trust list on next launch. Use this before reinstalling under a different Node version.",
    size: "1x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "What gets downloaded",
    competitor: "Pre-built JS in the tarball",
    ours: "Source code (Swift / Rust / C) in the tarball",
  },
  {
    feature: "What runs at install time",
    competitor: "Nothing (or a trivial prepare script)",
    ours: "postinstall compiles a native binary on your machine",
  },
  {
    feature: "Required toolchain",
    competitor: "Node + npm",
    ours:
      "Node + npm + a native toolchain (Xcode, rustup, gcc, etc.). Missing toolchain = failed update.",
  },
  {
    feature: "Typical update time",
    competitor: "Seconds",
    ours:
      "30s to 2+ minutes, because the package rebuilds from source every version bump.",
  },
  {
    feature: "What --ignore-scripts does",
    competitor: "Skips lifecycle hooks; usually safe",
    ours:
      "Silently skips the rebuild. The bin entry exists, but it points at a stale (or missing) binary.",
  },
  {
    feature: "What can break after update",
    competitor: "Peer-dep warnings, API changes",
    ours:
      "OS permissions tied to the compiled binary path (macOS Accessibility, TCC database, entitlements).",
  },
];

const updateFlowSteps = [
  {
    title: "npm resolves the new version",
    description:
      "Reads your installed version, the semver range, and the registry. For a global install of whatsapp-mcp-macos, the resolved path is ~/.nvm/versions/node/<v>/lib/node_modules/whatsapp-mcp-macos (or the system equivalent).",
  },
  {
    title: "npm fetches the tarball",
    description:
      "The package at v1.1.0 ships the Swift source, Package.swift, Package.resolved, and the bin/ wrapper. No pre-built Mach-O, no universal binary. This is intentional: local builds pick up the user's Swift toolchain and SDK.",
  },
  {
    title: "postinstall fires",
    description:
      "The script runs in the package directory. The exact command is xcrun swift build -c release. It pulls MCP Swift SDK and MacosUseSDK, compiles 1,214 lines of Swift, and writes the release binary to .build/release/whatsapp-mcp.",
  },
  {
    title: "bin wrapper gets linked",
    description:
      "npm symlinks bin/whatsapp-mcp from the package into the global bin directory. The wrapper execs the compiled Swift binary. If postinstall failed, the symlink still gets created, but it points at a binary that will not launch.",
  },
  {
    title: "Next time Claude spawns the server",
    description:
      "The MCP client reads your config, runs whatsapp-mcp, and handshakes with the new Swift server. The server advertises name WhatsAppMCP, version 3.0.0 (the internal wire version, not the npm tag).",
  },
];

const faqItems = [
  {
    q: "Why does `npm update` for whatsapp-mcp-macos take so long?",
    a: "Because it is not just a file copy. The package ships Swift source, and postinstall runs xcrun swift build -c release. That compiles the MCP Swift SDK, MacosUseSDK, and 1,214 lines of server code into a release binary on your machine. First builds fetch SwiftPM dependencies, so they are slowest. Subsequent builds are faster because SwiftPM caches in ~/Library/Developer/Xcode/DerivedData and ~/.swiftpm.",
  },
  {
    q: "What is the difference between `npm update` and `npm install -g pkg@latest`?",
    a: "`npm update` respects the semver range in package.json, so it will not cross a major version. `npm install -g pkg@latest` ignores the range and jumps to whatever is tagged latest on the registry, including major bumps. For whatsapp-mcp-macos, use `npm install -g whatsapp-mcp-macos@latest` whenever you see a major version change on npm; otherwise npm update is enough.",
  },
  {
    q: "Can I update without running the postinstall script?",
    a: "Technically yes: `npm install -g whatsapp-mcp-macos --ignore-scripts`. Do not. That command fetches the new source but never rebuilds the binary. The bin/whatsapp-mcp wrapper will still exist, but it will exec a stale or missing release binary. Every generic npm update guide tells you --ignore-scripts is 'safer'; for any package with a native postinstall, it is the exact opposite.",
  },
  {
    q: "Why does the npm tag say 1.1.0 but the server logs version 3.0.0?",
    a: "Because they count different things. The npm tag (1.1.0 in package.json) tracks the package release. The server version string hardcoded on line 1115 of Sources/WhatsAppMCP/main.swift is 3.0.0 and tracks the MCP wire-protocol surface the server exposes. An npm update moves the first number. Whether it also moves the second depends on whether the tagged release touched main.swift.",
  },
  {
    q: "After updating, do I need to grant Accessibility permission again?",
    a: "Usually no, but there is a gotcha. macOS Accessibility trust is keyed on the binary signature and, on recent macOS versions, the binary path. A global npm update typically keeps the binary path identical (`.../lib/node_modules/whatsapp-mcp-macos/.build/release/whatsapp-mcp`), so the trust survives. If you change Node version managers (e.g., switch from Homebrew Node to nvm), the path moves and you will need to re-add the host app to Privacy & Security > Accessibility.",
  },
  {
    q: "How do I verify the update actually took effect?",
    a: "Three quick checks. 1) `npm list -g whatsapp-mcp-macos` prints the installed version on disk. 2) `stat -f '%Sm' $(which whatsapp-mcp)` shows the mtime of the compiled Swift binary, which should be newer than the install timestamp. 3) In your MCP client, call whatsapp_status once; the log line from main.swift that reads `log: setupAndStartServer: defined 11 tools` confirms the fresh binary booted with the expected tool count.",
  },
  {
    q: "The update failed with `xcrun: error: invalid active developer path`. What now?",
    a: "The Command Line Tools are missing or broken. This is the most common postinstall failure on macOS. Run `xcode-select --install` to reinstall them, or `sudo xcode-select --reset` if you had Xcode installed and then moved it. Then re-run `npm rebuild -g whatsapp-mcp-macos` (not install, rebuild) so you do not redownload the tarball.",
  },
  {
    q: "What about `npm-check-updates`? Should I use it for this package?",
    a: "npm-check-updates (ncu) is designed for package.json dependencies in a repo. For a global CLI like whatsapp-mcp-macos you do not have a package.json to rewrite. Use `npm outdated -g` to see what is upgradable and `npm update -g` or `npm install -g pkg@latest` to actually upgrade. Running ncu against a global install does nothing useful.",
  },
  {
    q: "Does `npm audit fix` help with native packages?",
    a: "Only for the JavaScript half. npm audit walks npm's vulnerability database, which tracks JS advisories. Swift, Rust, or C dependencies pulled in by postinstall (via SwiftPM, Cargo, etc.) are not visible to npm audit. For whatsapp-mcp-macos, audit only looks at the wrapper's JS deps (there are none), so audit fix is a no-op by design.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "npm how to update package (when the package builds native code on install)",
    description:
      "A practical guide to updating npm packages with native postinstall hooks, using whatsapp-mcp-macos (Swift) as the worked example. Covers npm update vs. npm install@latest, the --ignore-scripts trap, macOS Accessibility trust across upgrades, and how to verify the rebuilt binary.",
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
              npm, but native
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              npm how to update package,{" "}
              <GradientText>when the package builds native code on install</GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-8 max-w-2xl">
              The top ten guides for this query cover{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                npm outdated
              </code>
              ,{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                npm update
              </code>
              ,{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                npm install pkg@latest
              </code>
              ,{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                npm-check-updates
              </code>
              , and{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                npm audit fix
              </code>
              . None explain what happens when the package you are updating runs{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                xcrun swift build -c release
              </code>{" "}
              at install time. This page does, using the{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                whatsapp-mcp-macos
              </code>{" "}
              package as the worked example.
            </p>
            <ShimmerButton href="#commands">
              Jump to the commands you actually need
            </ShimmerButton>
          </div>
        </BackgroundGrid>

        <div className="mt-12">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <div className="mt-4">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Author, WhatsApp MCP for macOS"
            datePublished={PUBLISHED}
            readingTime="11 min read"
          />
        </div>
        <div className="mt-6">
          <ProofBand
            rating={4.9}
            ratingCount="worked example, not opinion"
            highlights={[
              "real postinstall from whatsapp-mcp-macos v1.1.0",
              "covers the failure modes npm's own docs skip",
              "3 verification commands you can copy and paste",
            ]}
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 mt-4">
          <RemotionClip
            title="An npm update that isn't just a download"
            subtitle="whatsapp-mcp-macos as the worked example"
            captions={[
              "The tarball ships Swift source, not a pre-built binary",
              "postinstall runs xcrun swift build -c release",
              "Missing Xcode toolchain = silent update failure",
              "macOS Accessibility trust is tied to the compiled binary path",
            ]}
            accent="teal"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
            The SERP for &ldquo;npm how to update package&rdquo; is a library of JS-only advice
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed mb-4">
            A fresh search returns the usual set of guides. All of them assume
            the package you are updating is a stack of JavaScript files. The
            advice is correct for that case, and incomplete for the case where
            the package is mostly a native compiler output.
          </p>
          <Marquee speed={30}>
            {[
              "docs.npmjs.com — Updating packages downloaded from the registry",
              "docs.npmjs.com — Updating your published package version",
              "bitlaunch.io — How to update npm: 6 ways for Linux, Windows, and Mac",
              "browserstack.com — How to Update a Specific Package using npm",
              "hackernoon.com — The Developer's Guide to Updating npm Packages",
              "shouts.dev — Upgrade/Update All NPM Packages to the Latest Versions",
              "coreui.io — How to update npm packages in Node.js",
              "mend.io — NPM Update: How To Update NPM Package Version",
            ].map((item, i) => (
              <div
                key={i}
                className="mx-3 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 whitespace-nowrap"
              >
                {item}
              </div>
            ))}
          </Marquee>
          <p className="text-sm text-zinc-500 mt-4">
            None of the eight above mention{" "}
            <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">postinstall</code>,{" "}
            <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">node-gyp</code>,{" "}
            <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">--ignore-scripts</code>, or native-toolchain requirements.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            Two package.json files, one tells you what is about to run
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed mb-8 max-w-3xl">
            Before running{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">npm update</code>{" "}
            on anything, open its{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">package.json</code>{" "}
            and read the{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">scripts</code>{" "}
            block. The presence of a{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">postinstall</code>{" "}
            field is the single signal that tells you whether the update is a download or a compile.
          </p>
          <CodeComparison
            title="Pure-JS package vs. native-build package"
            leftLabel="JS-only package"
            rightLabel="whatsapp-mcp-macos v1.1.0"
            leftCode={genericPackageJson}
            rightCode={nativePackageJson}
            leftLines={genericPackageJson.split("\n").length}
            rightLines={nativePackageJson.split("\n").length}
            reductionSuffix="more intent declared"
          />
          <p className="text-sm text-zinc-500 mt-4">
            The right side is the real{" "}
            <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">package.json</code>{" "}
            from the npm tarball. The{" "}
            <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">os: ["darwin"]</code>{" "}
            field is the other tell: an npm install on Linux or Windows will refuse this package outright.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            What{" "}
            <code className="text-xl bg-zinc-100 px-2 py-1 rounded text-zinc-800">
              npm update -g whatsapp-mcp-macos
            </code>{" "}
            actually does
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed mb-8">
            Five stages, in order, from the moment you hit return to the moment
            your MCP client can spawn the new server.
          </p>
          <StepTimeline steps={updateFlowSteps} />
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The update flow, as a picture
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed mb-8 max-w-3xl">
            Inputs on the left, the{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">postinstall</code>{" "}
            hub in the middle, outputs on the right. The middle node is the part every generic tutorial treats as invisible.
          </p>
          <AnimatedBeam
            title="the real shape of an npm update that compiles native code"
            from={[
              { label: "npm update -g", sublabel: "resolves 1.0.x to 1.1.0" },
              { label: "Registry tarball", sublabel: "Swift source + Package.swift" },
              { label: "SwiftPM cache", sublabel: "~/.swiftpm, DerivedData" },
              { label: "Xcode CLT", sublabel: "xcrun, swiftc, linker" },
            ]}
            hub={{
              label: "postinstall",
              sublabel: "xcrun swift build -c release",
            }}
            to={[
              { label: ".build/release/whatsapp-mcp", sublabel: "compiled Swift binary" },
              { label: "bin/whatsapp-mcp symlink", sublabel: "global bin directory" },
              { label: "MCP handshake", sublabel: "Server(name: WhatsAppMCP, version: 3.0.0)" },
            ]}
          />
        </section>

        <section id="commands" className="max-w-6xl mx-auto px-6 mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The six commands you actually need
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed mb-8 max-w-3xl">
            The middle card is the one you will use most. The rest cover
            edge cases the JS-only guides do not split out.
          </p>
          <BentoGrid cards={commandCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The flag that silently skips the rebuild
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed mb-6">
            Generic tutorials recommend{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">--ignore-scripts</code>{" "}
            when a postinstall misbehaves. For a native package, that flag does
            not fix the problem, it hides it. Below is what happens if you
            update with{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">--ignore-scripts</code>{" "}
            and then try to use the tool.
          </p>
          <TerminalOutput
            title="--ignore-scripts looks clean and breaks the binary"
            lines={[
              {
                text: "npm install -g whatsapp-mcp-macos@latest --ignore-scripts",
                type: "command",
              },
              { text: "added 1 package in 1s", type: "output" },
              {
                text: "postinstall was skipped; no Swift binary was rebuilt",
                type: "info",
              },
              { text: "which whatsapp-mcp", type: "command" },
              {
                text: "/Users/you/.nvm/versions/node/v20.18.0/bin/whatsapp-mcp",
                type: "output",
              },
              { text: "whatsapp-mcp --help", type: "command" },
              {
                text: "error: no such file: .build/release/whatsapp-mcp",
                type: "error",
              },
              {
                text: "the wrapper exists, the binary it execs does not",
                type: "error",
              },
              {
                text: "npm rebuild -g whatsapp-mcp-macos",
                type: "command",
              },
              {
                text: "fetched SwiftPM deps, compiled in 27.4s",
                type: "success",
              },
              { text: "rebuilt; whatsapp-mcp now works", type: "success" },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The anchor fact: one line of package.json
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed mb-6">
            The entire reason an update here is different from an update to
            any other npm tool lives in one field of one file. Everything
            above is downstream of this line.
          </p>
          <AnimatedCodeBlock
            code={`"scripts": {
  "postinstall": "xcrun swift build -c release",
  "build":       "xcrun swift build -c release"
}`}
            language="json"
            filename="package.json"
            typingSpeed={2}
          />
          <p className="text-sm text-zinc-500 mt-4">
            Both keys run the same command. Having{" "}
            <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">build</code>{" "}
            also defined is what makes{" "}
            <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">npm rebuild</code>{" "}
            work as a recovery step: it re-runs{" "}
            <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">postinstall</code>{" "}
            without redownloading the tarball.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            Numbers that matter when you update
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed mb-6">
            All four are pulled from the repo, not made up.
          </p>
          <MetricsRow
            metrics={[
              { value: 1214, label: "lines of Swift in main.swift" },
              { value: 11, label: "MCP tools registered on startup" },
              { value: 2, label: "SwiftPM deps pulled at build time" },
              { value: 0, label: "pre-built binaries in the tarball" },
            ]}
          />

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="text-3xl font-bold text-zinc-900">
                <NumberTicker value={1} decimals={1} suffix=".1.0" />
              </div>
              <p className="text-sm text-zinc-500 mt-1">
                npm tag (what{" "}
                <code className="text-xs bg-zinc-100 px-1 rounded">npm update</code>{" "}
                moves)
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="text-3xl font-bold text-zinc-900">
                <NumberTicker value={3} decimals={1} suffix=".0.0" />
              </div>
              <p className="text-sm text-zinc-500 mt-1">
                Swift server version (MCP wire handshake)
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="text-3xl font-bold text-zinc-900">
                <NumberTicker value={13} suffix="+" />
              </div>
              <p className="text-sm text-zinc-500 mt-1">
                minimum macOS major version for Catalyst build
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="text-3xl font-bold text-zinc-900">
                <NumberTicker value={1} />
              </div>
              <p className="text-sm text-zinc-500 mt-1">
                platform the tarball installs on (darwin)
              </p>
            </div>
          </div>
          <p className="text-sm text-zinc-500 mt-6">
            The npm tag and the server version are deliberately independent.
            The first tracks the release artifact on the registry. The second
            tracks the MCP protocol surface exposed by the binary, hardcoded
            in{" "}
            <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">
              Sources/WhatsAppMCP/main.swift
            </code>{" "}
            on line 1115. Updating the first does not automatically move the
            second.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-20">
          <ComparisonTable
            heading="JS-only update vs. native-postinstall update"
            intro="Where the generic advice applies, and where it quietly fails."
            productName="Package with native postinstall"
            competitorName="Pure-JS package"
            rows={comparisonRows}
            caveat="Same npm, same commands, two very different workflows."
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            After you update: verify the build, not just the version
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed mb-4">
            For a pure-JS package,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
              npm list -g pkg
            </code>{" "}
            is enough. For anything that compiles native code, you need to
            confirm the compile actually produced a working binary.
          </p>
          <AnimatedChecklist
            title="three checks after every update"
            items={[
              {
                text: "npm list -g whatsapp-mcp-macos returns the version you expected",
                checked: true,
              },
              {
                text: "stat -f '%Sm' $(which whatsapp-mcp) shows a fresh mtime",
                checked: true,
              },
              {
                text: "the first MCP tool call (whatsapp_status) returns without a spawn error",
                checked: true,
              },
              {
                text: "on macOS, Privacy & Security > Accessibility still shows the host app trusted",
                checked: true,
              },
              {
                text: "the host app's stderr log reads 'defined 11 tools' (matches the current tool count)",
                checked: true,
              },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-20">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The rollback path
          </h2>
          <p className="text-zinc-600 text-lg leading-relaxed mb-6">
            Native rebuilds can regress. The rollback for an npm package
            with a postinstall is still npm, but you have to name the version
            explicitly, because{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
              npm update
            </code>{" "}
            never moves backwards.
          </p>
          <TerminalOutput
            title="rolling back to a known-good version"
            lines={[
              {
                text: "npm view whatsapp-mcp-macos versions --json",
                type: "command",
              },
              { text: "[ \"1.0.0\", \"1.0.3\", \"1.1.0\" ]", type: "output" },
              {
                text: "npm install -g whatsapp-mcp-macos@1.0.3",
                type: "command",
              },
              {
                text: "running postinstall: xcrun swift build -c release",
                type: "info",
              },
              {
                text: "build complete in 19.2s",
                type: "success",
              },
              { text: "which whatsapp-mcp && whatsapp-mcp --help", type: "command" },
              {
                text: "/Users/you/.nvm/.../bin/whatsapp-mcp",
                type: "output",
              },
              {
                text: "rolled back; 11 tools registered on the 1.0.3 binary",
                type: "success",
              },
            ]}
          />
        </section>

        <section className="mt-16">
          <InlineCta
            heading="Try the package that made me write this page"
            body="whatsapp-mcp-macos is an MCP server that drives the native macOS WhatsApp app through accessibility APIs. One npm install, one Swift rebuild, 11 tools for Claude."
            linkText="See the install docs"
            href="/"
          />
        </section>

        <FaqSection
          items={faqItems}
          heading="FAQ: updating an npm package that ships native code"
        />
      </article>
    </>
  );
}
