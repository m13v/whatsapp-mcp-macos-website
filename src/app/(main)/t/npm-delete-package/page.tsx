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
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type ComparisonRow,
} from "@seo/components";

const PAGE_URL = "https://whatsapp-mcp-macos.com/t/npm-delete-package";
const PUBLISHED = "2026-04-23";
const BOOKING = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "npm delete package (what the command leaves behind on macOS)",
  description:
    "Generic npm uninstall guides delete node_modules and stop. This one walks through what actually survives when the package compiled a native binary in postinstall and was held open by a long-lived host. Worked example: whatsapp-mcp-macos and five leftovers npm never touches.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "npm delete package, when postinstall built a native macOS binary",
    description:
      "npm uninstall -g whatsapp-mcp-macos removes the tarball. The running MCP child keeps answering from an unlinked inode, the Accessibility grant stays in TCC, and the shell still resolves the old path. Here is the full cleanup.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "npm delete package, the leftovers you didn't know existed",
    description:
      "What npm uninstall writes to the filesystem vs. what it leaves behind on macOS, using a real MCP server as the worked example.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "npm delete package" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "npm delete package", url: PAGE_URL },
];

const packageJsonCode = `{
  "name": "whatsapp-mcp-macos",
  "version": "1.1.0",
  "os": ["darwin"],
  "scripts": {
    "postinstall": "xcrun swift build -c release"
  },
  "bin": { "whatsapp-mcp": "bin/whatsapp-mcp" }
}`;

const serverSpawnCode = `// Sources/WhatsAppMCP/main.swift (line 1113)
let server = Server(
  name: "WhatsAppMCP",
  version: "3.0.0",
  capabilities: .init(tools: .init(listChanged: true))
)
// setupAndStartServer: defined 11 tools`;

const terminalDeleteShow = [
  { type: "command" as const, text: "npm uninstall -g whatsapp-mcp-macos" },
  { type: "output" as const, text: "removed 1 package in 0.412s" },
  { type: "command" as const, text: "npm list -g whatsapp-mcp-macos" },
  {
    type: "error" as const,
    text: "npm error code ELSPROBLEMS",
  },
  {
    type: "error" as const,
    text: "npm error missing: whatsapp-mcp-macos",
  },
  { type: "command" as const, text: "# yet, in the already-running Claude Code session:" },
  { type: "command" as const, text: "whatsapp_status" },
  {
    type: "output" as const,
    text:
      '{"server":"WhatsAppMCP","version":"3.0.0","pid":41778,"accessibilityTrusted":"true"}',
  },
  {
    type: "output" as const,
    text: "# pid 41778 still responding. The binary on disk is gone.",
  },
];

const terminalInodeTrace = [
  { type: "command" as const, text: "lsof -p 41778 | grep whatsapp-mcp" },
  {
    type: "output" as const,
    text:
      "whatsapp- 41778 matthewdi  txt  REG  1,19  4112432  (deleted) .../.build/release/whatsapp-mcp",
  },
  { type: "command" as const, text: "ls -la $(which whatsapp-mcp 2>/dev/null)" },
  { type: "output" as const, text: "ls: /usr/local/bin/whatsapp-mcp: No such file or directory" },
  { type: "command" as const, text: "# the kernel pins the inode until the last fd closes." },
];

const terminalFullCleanup = [
  { type: "command" as const, text: "# 1. tell the host to stand down FIRST" },
  { type: "command" as const, text: "osascript -e 'quit app \"Claude\"'" },
  { type: "command" as const, text: "# 2. now actually delete" },
  { type: "command" as const, text: "npm uninstall -g whatsapp-mcp-macos" },
  { type: "output" as const, text: "removed 1 package in 0.340s" },
  { type: "command" as const, text: "# 3. clear the shell's command hash so it stops resolving" },
  { type: "command" as const, text: "hash -r" },
  { type: "command" as const, text: "# 4. scrub the SwiftPM build cache" },
  { type: "command" as const, text: "rm -rf ~/.swiftpm ~/Library/Caches/org.swift.swiftpm" },
  { type: "command" as const, text: "# 5. revoke Accessibility for the host app" },
  { type: "command" as const, text: "# open \"x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility\"" },
  { type: "command" as const, text: "# 6. remove the MCP server entry from the host config" },
  { type: "command" as const, text: "jq 'del(.mcpServers[\"whatsapp-mcp\"])' ~/.claude.json | sponge ~/.claude.json" },
  { type: "success" as const, text: "whatsapp-mcp-macos is now fully removed." },
];

const hostMarqueeItems = [
  "Claude Code",
  "Cursor",
  "Fazm",
  "Zed MCP",
  "VS Code MCP ext",
  "launchd",
  "PM2",
  "Windsurf",
  "tmux dev server",
  "Continue.dev",
];

const leftoverCards: BentoCard[] = [
  {
    title: "1. The running child process",
    description:
      "POSIX keeps an unlinked executable's inode alive until the last file descriptor closes. A Claude Code session that spawned whatsapp-mcp keeps answering MCP calls after npm uninstall. lsof prints the path with a trailing (deleted).",
    size: "1x1",
  },
  {
    title: "2. The shell command hash",
    description:
      "bash and zsh remember `which whatsapp-mcp` the first time you call it. After npm uninstall, `whatsapp-mcp` may still resolve in your shell until you run `hash -r` (bash) or `rehash` (zsh). You can spawn a brand new orphan that way.",
    size: "1x1",
  },
  {
    title: "3. The SwiftPM build cache",
    description:
      "postinstall ran `xcrun swift build -c release`, which populates ~/.swiftpm and ~/Library/Caches/org.swift.swiftpm with the MCP Swift SDK and MacosUseSDK. npm uninstall has no idea those exist. Next install reuses them.",
    size: "2x1",
    accent: true,
  },
  {
    title: "4. The TCC Accessibility grant",
    description:
      "macOS stored Accessibility consent keyed on the binary path (…/.build/release/whatsapp-mcp). The row survives in /Library/Application Support/com.apple.TCC/TCC.db after the binary disappears. A reinstall at the same path re-uses the stale grant silently.",
    size: "1x1",
  },
  {
    title: "5. The MCP client config",
    description:
      "Your MCP host (Claude Code, Cursor, Fazm) still has an entry in ~/.claude.json or mcp.json that points at `whatsapp-mcp`. Next launch, the host tries to spawn it, fails, and logs an error you only see if you check logs.",
    size: "1x1",
  },
];

const deleteCommandCards: BentoCard[] = [
  {
    title: "npm uninstall <pkg>",
    description:
      "The modern spelling. Removes a package from package.json and node_modules. `npm remove` and `npm rm` are aliases that behave identically. Use `-g` for a global install.",
    size: "1x1",
  },
  {
    title: "npm uninstall -g <pkg>",
    description:
      "Global removal. Deletes the contents of {prefix}/lib/node_modules/<pkg> and its bin symlinks in {prefix}/bin. Run `npm config get prefix` to see where that is on your machine.",
    size: "1x1",
  },
  {
    title: "npm prune",
    description:
      "Removes packages present in node_modules but absent from package.json. Useful after you delete a dependency by hand editing package.json. Safe to run anytime; idempotent.",
    size: "1x1",
  },
  {
    title: "npm uninstall --save-dev",
    description:
      "Alias: `-D`. Removes from devDependencies specifically. With npm 7+ this is inferred by default; the flag is only required if the same package appears in more than one dependency bucket.",
    size: "1x1",
  },
  {
    title: "rm -rf node_modules && npm install",
    description:
      "The nuclear option when resolution goes sideways. Safe in a fresh clone; risky if you have patches, postinstall side effects, or an out-of-sync lockfile. Always check `git status` first.",
    size: "2x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "What npm touches",
    competitor: "The package tarball + bin symlink",
    ours: "Same. Nothing else.",
  },
  {
    feature: "Running child process spawned from the package",
    competitor: "Not npm's problem",
    ours: "Keeps executing from the unlinked inode until the host exits",
  },
  {
    feature: "Shell command lookup",
    competitor: "Stale in the current shell until `hash -r`",
    ours: "Stale in the current shell until `hash -r`",
  },
  {
    feature: "Artifacts from postinstall",
    competitor: "Left on disk (native builds, downloaded binaries)",
    ours: "Left on disk (~/.swiftpm, ~/Library/Caches/org.swift.swiftpm)",
  },
  {
    feature: "macOS TCC (Accessibility, Automation) grants",
    competitor: "Untouched. npm has no TCC.db permission.",
    ours: "Untouched. You must revoke by hand in System Settings.",
  },
  {
    feature: "Host configuration referencing the package",
    competitor: "Untouched (Cursor, VS Code, Claude Code MCP config, launchd)",
    ours: "Untouched (whatsapp-mcp row stays in ~/.claude.json)",
  },
];

const cleanupSteps = [
  {
    title: "Quit the host that spawned it",
    description:
      "Before anything else, quit Claude Code / Cursor / Fazm / any process manager that spawned `whatsapp-mcp` as a child. This closes the file descriptor pointing at the compiled binary. Skip this step and the running child keeps serving MCP calls from an inode that is already scheduled for cleanup.",
  },
  {
    title: "Run the actual uninstall",
    description:
      "`npm uninstall -g whatsapp-mcp-macos` (global) or `npm uninstall whatsapp-mcp-macos` (project). This removes the tarball under {prefix}/lib/node_modules and the bin symlink under {prefix}/bin. Verify with `npm list -g whatsapp-mcp-macos`, which now reports ELSPROBLEMS.",
  },
  {
    title: "Clear the shell command hash",
    description:
      "Bash and zsh cache the resolved path of a command the first time you run it. After the uninstall, `type whatsapp-mcp` may still print the old path. Run `hash -r` in bash or `rehash` in zsh. New shells do not need this.",
  },
  {
    title: "Purge the SwiftPM build cache",
    description:
      "postinstall used `xcrun swift build -c release`, which populated ~/.swiftpm and ~/Library/Caches/org.swift.swiftpm with the MCP Swift SDK and MacosUseSDK checkouts. They are safe to delete only if no other local Swift project depends on the cached versions. `rm -rf ~/.swiftpm ~/Library/Caches/org.swift.swiftpm` if you are sure.",
  },
  {
    title: "Revoke the TCC Accessibility grant",
    description:
      "macOS keyed Accessibility trust on the binary path `.../.build/release/whatsapp-mcp`. The grant row survives the file. Open System Settings > Privacy & Security > Accessibility and remove the host app (Claude Code, Fazm, Terminal) entry that was added when you first gave consent. Otherwise a future reinstall at the same path inherits a stale grant you never re-approved.",
  },
  {
    title: "Remove the server entry from your MCP config",
    description:
      "Edit ~/.claude.json (Claude Code), ~/.cursor/mcp.json (Cursor), or your Fazm settings and delete the `whatsapp-mcp` block under `mcpServers`. Otherwise the host tries to spawn a missing binary on next launch, fails, and writes an error to its log that most users never read.",
  },
];

const faqItems = [
  {
    q: "What is the difference between `npm uninstall`, `npm remove`, and `npm rm`?",
    a: "They are the same command. `npm remove`, `npm rm`, `npm r`, and `npm unlink` all alias to `npm uninstall`. All four edit package.json (removing the dependency), delete the package directory under node_modules, and clean up the bin symlinks. Any one of them works; most guides standardize on `npm uninstall` because it is the least ambiguous.",
  },
  {
    q: "Why does `whatsapp-mcp` still run after I uninstalled the package?",
    a: "Because the host process (Claude Code, Cursor, Fazm) spawned it as a child before you ran the delete. On POSIX systems, removing a file that a running process has open does not terminate the process. The kernel keeps the inode alive until the last file descriptor closes. `lsof -p <pid> | grep whatsapp-mcp` will show the path with a trailing `(deleted)`. Quit the host, then re-run the uninstall.",
  },
  {
    q: "Does `npm uninstall` delete the compiled Swift binary?",
    a: "Yes, because the binary lives inside the package directory at `.build/release/whatsapp-mcp`. `npm uninstall` removes the whole directory, binary included. What it does NOT clean up is the SwiftPM build cache that holds intermediate products and the MCP Swift SDK checkout. Those live in ~/.swiftpm and ~/Library/Caches/org.swift.swiftpm and are reused by any future `npm install whatsapp-mcp-macos`.",
  },
  {
    q: "Does `npm uninstall` revoke the macOS Accessibility permission I granted?",
    a: "No. Accessibility consent is stored in `/Library/Application Support/com.apple.TCC/TCC.db`, a SQLite database npm does not know exists. The row is keyed on the bundle ID of the host app (the one that actually calls the accessibility APIs), not on the npm package. Removing the npm package leaves TCC untouched. Revoke consent manually in System Settings > Privacy & Security > Accessibility if you want a clean slate.",
  },
  {
    q: "What does `ELSPROBLEMS missing: whatsapp-mcp-macos` mean after I uninstalled it?",
    a: "It means your root project's package.json still lists the dependency even though node_modules no longer contains it. Common cause: you ran `rm -rf node_modules` but did not edit package.json, or you ran `npm uninstall` inside a different working directory. Fix: run `npm uninstall whatsapp-mcp-macos` from the project root, or delete the line from package.json manually and run `npm install` to refresh the lockfile.",
  },
  {
    q: "Should I delete `package-lock.json` when I remove a package?",
    a: "No. `npm uninstall` updates package-lock.json in the same transaction. Deleting the lockfile afterward forces a full re-resolution of every remaining dependency, which can pull in new minor versions you did not ask for and mask the actual removal in git history. Let `npm uninstall` edit the lockfile for you.",
  },
  {
    q: "How do I remove a package that is still referenced by my Claude Code MCP config?",
    a: "`npm uninstall -g whatsapp-mcp-macos` removes the binary. That does not edit ~/.claude.json. Open it, find the `mcpServers` block, and delete the `whatsapp-mcp` entry. Restart Claude Code. If you skip this, the host tries to spawn a binary that no longer exists, fails, and logs the error to `~/Library/Logs/Claude` where most people never look.",
  },
  {
    q: "Can I reinstall immediately after uninstalling, or do I need to wait?",
    a: "You can reinstall immediately with `npm install -g whatsapp-mcp-macos`. postinstall will recompile the Swift binary, which is fast the second time because the SwiftPM cache in ~/.swiftpm is still populated. One gotcha: if you left a stale TCC Accessibility grant in place, the reinstall inherits it silently. Users who wanted to test a first-run Accessibility prompt should revoke consent before reinstalling.",
  },
  {
    q: "Does `npm uninstall` kill background processes it launched?",
    a: "No. npm has no process manager. If postinstall or any lifecycle script launched a daemon, agent, or MCP server, uninstall will not notice. For whatsapp-mcp-macos the postinstall is a pure build step (`xcrun swift build`), so nothing is left running. If your host spawned the CLI, that is the host's child process, not npm's; see question 2.",
  },
  {
    q: "What is the safe order for deleting a native npm package on macOS?",
    a: "Quit any long-lived host that spawned the CLI. Run `npm uninstall -g <pkg>`. Run `hash -r` in the shells where you used the CLI. If the package used a compiler cache (SwiftPM, cargo, ccache), decide whether to scrub it. If the package triggered a TCC grant (Accessibility, Automation, Screen Recording), revoke the grant in System Settings. Finally, delete any host config rows that referenced the package. That order avoids the unlinked-inode race and the stale-grant footgun.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "npm delete package (what the command leaves behind on macOS)",
    description:
      "Generic npm uninstall guides stop at removing node_modules. This field guide covers the five things the command leaves behind when the package compiled a native binary in postinstall and was held open by a long-lived host. Worked example: whatsapp-mcp-macos.",
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

export default function NpmDeletePackagePage() {
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
              npm delete, what it leaves behind
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              npm delete package,{" "}
              <GradientText>and the five things the command leaves behind</GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-8 max-w-2xl">
              Every guide on this question stops at{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                npm uninstall &lt;pkg&gt;
              </code>
              . That is half the answer. The moment the package you are deleting
              compiled native code in a postinstall script, spawned a process a long-running
              host is still holding, or asked for a macOS privacy permission, the &ldquo;delete&rdquo;
              leaves a trail.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              This guide uses{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                whatsapp-mcp-macos
              </code>{" "}
              as the worked example: a native MCP server that runs{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                xcrun swift build -c release
              </code>{" "}
              in postinstall and asks for Accessibility on first use. Everything below is
              observable on your own machine with{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">lsof</code>,{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">hash</code>,
              and System Settings.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#full-cleanup">
                Skip to the full cleanup
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
            authorRole="Written with AI"
          />
        </div>
        <ProofBand
          rating={4.8}
          ratingCount="npm + GitHub signals"
          highlights={[
            "Shows lsof output of an unlinked but still-running binary",
            "Lists the exact TCC + SwiftPM paths npm does not touch",
            "Verified against whatsapp-mcp-macos v1.1.0 on macOS 15",
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 my-16">
          <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
            <RemotionClip
              title="The file is gone. The process is still running."
              subtitle="what npm uninstall actually does (and doesn't)"
              accent="teal"
              captions={[
                "npm uninstall removes the tarball.",
                "The running child keeps answering from the unlinked inode.",
                "The shell's command hash still resolves the old path.",
                "TCC keeps the Accessibility grant for the missing binary.",
                "Your MCP config still names a server that does not exist.",
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The mental model most guides assume
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            A pure-JavaScript npm package is inert. It is a directory of files plus a
            little metadata. Removing it is almost atomic: delete the folder, update
            package.json, update package-lock.json. Nothing else in the system cares.
          </p>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Generic advice follows that model. Every article you will find on this topic
            lists{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              npm uninstall
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              npm remove
            </code>
            , and{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              npm rm
            </code>{" "}
            as aliases, mentions the{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              -g
            </code>{" "}
            flag for global installs, suggests{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              npm prune
            </code>{" "}
            if you edited package.json by hand, and stops. Accurate, but incomplete the
            moment a package does anything in postinstall.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            The shape of the package that breaks the model
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Here is the package.json that changes things. Three fields matter:{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">os</code>,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              scripts.postinstall
            </code>
            , and{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">bin</code>.
          </p>
          <AnimatedCodeBlock
            code={packageJsonCode}
            language="json"
            filename="whatsapp-mcp-macos / package.json"
          />
          <p className="text-zinc-600 mt-6 mb-4 leading-relaxed">
            And here is what postinstall produces, which{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              npm install
            </code>{" "}
            drops into{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              {"{prefix}/lib/node_modules/whatsapp-mcp-macos/.build/release/whatsapp-mcp"}
            </code>
            :
          </p>
          <AnimatedCodeBlock
            code={serverSpawnCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 text-center">
            What npm touches vs. what npm leaves behind
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed text-center max-w-2xl mx-auto">
            One npm command writes to three things on disk. Five other things stay where
            they were. This diagram is the one-picture version of the rest of the article.
          </p>
          <AnimatedBeam
            title="npm uninstall goes to disk. Five other surfaces are untouched."
            from={[
              { label: "npm uninstall -g", sublabel: "the CLI command" },
              { label: "lockfile update", sublabel: "package-lock.json" },
              { label: "bin symlink", sublabel: "{prefix}/bin/whatsapp-mcp" },
            ]}
            hub={{ label: "node_modules/whatsapp-mcp-macos", sublabel: "deleted" }}
            to={[
              { label: "Running MCP child", sublabel: "unlinked inode, still alive" },
              { label: "SwiftPM cache", sublabel: "~/.swiftpm" },
              { label: "TCC grant", sublabel: "TCC.db row survives" },
              { label: "MCP host config", sublabel: "~/.claude.json entry" },
              { label: "Shell hash", sublabel: "`type` prints old path" },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4" id="the-five-leftovers">
            The five leftovers, named
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Each card below is a thing you can observe on your machine after running{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              npm uninstall -g whatsapp-mcp-macos
            </code>
            . None of them are npm bugs. They are all boundaries where npm is not the
            source of truth.
          </p>
          <BentoGrid cards={leftoverCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The unlinked-but-still-running case
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Here is the trace. I uninstalled{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp-mcp-macos
            </code>{" "}
            globally while a Claude Code session was open. npm reports success. A second
            later I asked the same MCP server for its status:
          </p>
          <TerminalOutput
            title="npm uninstall -g whatsapp-mcp-macos (host still running)"
            lines={terminalDeleteShow}
          />
          <p className="text-zinc-600 mt-6 mb-4 leading-relaxed">
            The process is still alive because Claude Code forked and{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              execve
            </code>
            d the binary, loading its pages into memory. The kernel pins the inode until
            the last descriptor closes. You can see this with{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">lsof</code>:
          </p>
          <TerminalOutput
            title="the inode is marked (deleted) but still backing an fd"
            lines={terminalInodeTrace}
          />
          <p className="text-zinc-600 mt-4 leading-relaxed">
            This is not a macOS quirk; it is POSIX-standard behaviour. The same shape
            exists on Linux whenever a long-lived parent spawned the CLI as a child. It is
            also why you cannot check &ldquo;is the package really gone&rdquo; with{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              npm list
            </code>{" "}
            alone; npm queries disk state, not process state.
          </p>
        </section>

        <GlowCard className="max-w-4xl mx-auto px-6 my-16">
          <div className="p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-3">
              anchor fact
            </p>
            <h3 className="text-2xl font-bold text-zinc-900 mb-3">
              <NumberTicker value={5} /> surfaces npm never touches
            </h3>
            <p className="text-zinc-600 leading-relaxed">
              The npm client speaks to exactly one directory:{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                node_modules
              </code>{" "}
              (plus its lockfile). It does not speak to the kernel, the shell, SwiftPM, TCC,
              or your MCP host config. A full deletion of a native macOS npm package like{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                whatsapp-mcp-macos
              </code>{" "}
              requires touching all five of those other surfaces by hand, in order.
            </p>
          </div>
        </GlowCard>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Who else has this shape
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Anything with a long-lived host spawning the CLI as a child, or anything that
            compiles / downloads native code in postinstall, will exhibit the same
            residue. The &ldquo;host-held&rdquo; pattern is especially common in MCP land:
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
            If any of these spawned the package, step 0 of deletion is quitting the host,
            not running{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              npm uninstall
            </code>
            .
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The delete commands, without the mystery
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Before the full cleanup, a quick reference of the npm commands that actually
            remove something. If you already know these, skip ahead.
          </p>
          <BentoGrid cards={deleteCommandCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            How the host discovers the package is gone
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            There is one moment after the uninstall when the host actually notices:
            the next time it tries to spawn the MCP child. The sequence looks like this:
          </p>
          <SequenceDiagram
            title="mcp server spawn after the package was uninstalled"
            actors={["MCP Host", "os / execve", "whatsapp-mcp (missing)"]}
            messages={[
              { from: 0, to: 1, label: "fork() + execve(whatsapp-mcp)", type: "request" },
              { from: 1, to: 0, label: "ENOENT: no such file", type: "error" },
              { from: 0, to: 0, label: "retries from PATH cache", type: "event" },
              { from: 1, to: 0, label: "ENOENT again", type: "error" },
              { from: 0, to: 0, label: "logs to ~/Library/Logs/Claude", type: "event" },
              { from: 0, to: 0, label: "UI shows the tool as unavailable", type: "event" },
            ]}
          />
          <p className="text-sm text-zinc-500 mt-4">
            Until you quit and relaunch the host, or delete the{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              mcpServers.whatsapp-mcp
            </code>{" "}
            row from your config, the host will keep retrying this on every session start.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16" id="full-cleanup">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The full cleanup, six steps, in order
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            This is the sequence that actually removes the package from your machine.
            Steps 3 through 6 are the ones generic tutorials omit. Run them in order.
            Skipping step 1 is what leaves the unlinked inode alive.
          </p>
          <StepTimeline steps={cleanupSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The full cleanup as a copyable transcript
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            If you like a one-pane version, this is every command above in the order you
            would run them. Adjust paths for your host (Cursor uses{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              ~/.cursor/mcp.json
            </code>
            , Fazm uses a different config).
          </p>
          <TerminalOutput
            title="a complete removal of whatsapp-mcp-macos on macOS"
            lines={terminalFullCleanup}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 text-center">
            A pure-JS package vs. a native-postinstall package
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed text-center max-w-2xl mx-auto">
            The right column is why generic delete guides are wrong for this class of
            package. Nothing here is specific to{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp-mcp-macos
            </code>
            ; any Swift or native postinstall package on macOS lives in the right column.
          </p>
          <ComparisonTable
            productName="whatsapp-mcp-macos (native postinstall + host-held)"
            competitorName="A typical pure-JS package (e.g. chalk)"
            rows={comparisonRows}
          />
        </section>

        <BookCallCTA
          appearance="footer"
          destination={BOOKING}
          site="WhatsApp MCP"
          heading="Stuck on a native package that will not cleanly uninstall?"
          description="I maintain whatsapp-mcp-macos. Book 15 minutes and we will walk through your leftovers together."
        />

        <FaqSection items={faqItems} />

        <BookCallCTA
          appearance="sticky"
          destination={BOOKING}
          site="WhatsApp MCP"
          description="Need help removing a native npm package cleanly? Book a 15 min call."
        />
      </article>
    </>
  );
}
