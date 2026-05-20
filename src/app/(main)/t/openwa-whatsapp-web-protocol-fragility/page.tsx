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
  TerminalOutput,
  StepTimeline,
  ComparisonTable,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/openwa-whatsapp-web-protocol-fragility";
const PUBLISHED = "2026-05-19";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";
const GITHUB = "https://github.com/m13v/whatsapp-mcp-macos";
const OPENWA_REPO = "https://github.com/open-wa/wa-automate-nodejs";
const OPENWA_WAPI =
  "https://github.com/open-wa/wa-automate-nodejs/blob/master/packages/core/src/transport/assets/wapi.js";
const OPENWA_3317 = "https://github.com/open-wa/wa-automate-nodejs/issues/3317";
const OPENWA_3326 = "https://github.com/open-wa/wa-automate-nodejs/issues/3326";

export const metadata: Metadata = {
  title:
    "openwa and WhatsApp Web protocol fragility: where it actually breaks",
  description:
    "openwa drives WhatsApp Web through Puppeteer and injects a script that pulls Meta's private webpack modules out of require(\"__debug\").modulesMap, matched by hardcoded names. The project ships a BROKEN_METHODS telemetry pipe because those hooks snap on every Meta-side bundle reship.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "openwa and WhatsApp Web protocol fragility",
    description:
      "Why openwa breaks so often: it pulls WhatsApp Web's internal webpack modules out of __debug.modulesMap by hardcoded names. The maintainers know it, that is why the project has a BROKEN_METHODS telemetry feature.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "openwa and WhatsApp Web protocol fragility",
    description:
      "openwa breaks because it hooks WhatsApp Web's private webpack modules by name. That is not a bug, it is the architecture.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "openwa and WhatsApp Web protocol fragility" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "openwa and WhatsApp Web protocol fragility", url: PAGE_URL },
];

const wapiSnippet = `// packages/core/src/transport/assets/wapi.js (paraphrased)
// openwa locates WhatsApp Web's internal modules by reaching into
// Meta's own webpack debug surface and looking for objects that
// expose specific methods. Every line here is a structural bet on
// a private API.

const modules = require("__debug").modulesMap;

window.Store = Object.assign({}, window.Store);

for (const key in modules) {
  const m = modules[key]?.exports;
  if (!m) continue;

  // Hooks are matched by hardcoded module name...
  if (key === "WAWebAttachMediaCollection") {
    window.Store.AttachMedia = m;
  }

  // ...or by checking which methods an object happens to expose.
  if (m.sendClear && m.blockContact) {
    window.Store.Wap = m;
  }

  if (m.default?.processFiles) {
    window.Store.MediaProcess = m.default;
  }
}

// If any of WAWebAttachMediaCollection, sendClear, blockContact,
// processFiles, etc. is renamed or moved in a future WhatsApp Web
// bundle, the matching Store entry is empty and every API that
// depends on it returns undefined or throws.`;

const brokenMethodsLog = [
  { text: "GET /api/healthCheck", type: "command" as const },
  {
    text: '{ "success": true, "response": { "wapiInjected": true, "state": "CONNECTED" } }',
    type: "output" as const,
  },
  { text: "POST /api/sendText", type: "command" as const },
  {
    text: '{ "success": false, "error": { "name": "ProtocolError",',
    type: "output" as const,
  },
  {
    text: '   "message": "Promise was collected" } }',
    type: "output" as const,
  },
  {
    text: "// reported in issue #3326, 2026-04-18, against current master",
    type: "info" as const,
  },
  { text: "// meanwhile, openwa's own telemetry phones home:", type: "info" as const },
  {
    text: '{ "BROKEN_METHODS": ["Store.unfixable"], "occurances": 9 }',
    type: "error" as const,
  },
  {
    text: "// straight from issue #3317, January 2026. the project is",
    type: "info" as const,
  },
  {
    text: "// telling on itself: a Store hook has failed nine times",
    type: "info" as const,
  },
  {
    text: "// and the codebase has no fix path for it.",
    type: "info" as const,
  },
];

const fragilityLayers = [
  {
    title: "It runs WhatsApp Web inside Puppeteer, not as a wire client",
    description:
      "openwa boots a Chromium instance through Puppeteer, navigates to web.whatsapp.com, and waits for you to scan a QR. From WhatsApp's side it is a brand new linked device session, the fifth or fourth slot on your account. Nothing about that is more 'native' than a real WhatsApp Web tab. The browser is the dependency.",
  },
  {
    title: "It injects a hand-written WAPI script into the page",
    description:
      "Once WhatsApp Web is loaded, openwa attaches a long file called wapi.js to the page context. That file is the actual bot: it builds a global window.Store that the Node side calls into via Puppeteer's page.evaluate. There is no API on the other side of this. There is just whatever Meta happens to expose in the bundle this week.",
  },
  {
    title: "It pulls modules out of require(\"__debug\").modulesMap",
    description:
      "WAPI grabs WhatsApp Web's webpack debug map, iterates every internal module, and matches modules by name (WAWebAttachMediaCollection) or by a heuristic of which methods they expose (sendClear, blockContact, processFiles). Every match is a structural bet that Meta keeps that exact shape across redeploys.",
  },
  {
    title: "It ships a BROKEN_METHODS telemetry pipe because the bets fail",
    description:
      "The codebase has a literal Store.unfixable state. When a hook cannot be reattached, openwa reports it through its own broken-methods channel: {\"BROKEN_METHODS\": [\"Store.unfixable\"]} (issue #3317, Jan 2026). The fact that this feature exists at all is the strongest possible statement about how often the underlying surface moves.",
  },
];

const compareRows = [
  {
    feature: "How it reaches WhatsApp",
    competitor:
      "Boots WhatsApp Web inside a headless Chromium via Puppeteer and pairs a new linked device.",
    ours:
      "Reads the on-screen accessibility tree of the genuine WhatsApp desktop app that you already use. No browser, no pairing.",
  },
  {
    feature: "What it depends on",
    competitor:
      "WhatsApp Web's private webpack modules, matched by hardcoded names and method-signature heuristics inside wapi.js.",
    ours:
      "macOS accessibility roles (AXButton, AXTextField, etc.) on the WhatsApp Catalyst app. Same API a screen reader uses.",
  },
  {
    feature: "What breaks it",
    competitor:
      "Any reship of WhatsApp Web's bundle that renames or refactors a hooked module. The project ships BROKEN_METHODS telemetry for exactly this.",
    ours:
      "WhatsApp shipping a new desktop build that reorganizes the UI tree, or accessibility permission getting revoked.",
  },
  {
    feature: "Linked-device slots used",
    competitor: "One. The Puppeteer session is the linked device.",
    ours: "Zero. The driver controls the device that is already linked.",
  },
  {
    feature: "Runs headless on a Linux server",
    competitor:
      "Yes. A Docker image and the EASY API are the project's main shipping format.",
    ours:
      "No. It needs a real macOS session with WhatsApp.app running and accessibility permission granted.",
  },
];

const verifyChecklist = [
  {
    label: "Open the WAPI source on master",
    detail: (
      <a
        href={OPENWA_WAPI}
        className="text-teal-700 underline"
        rel="noopener"
      >
        packages/core/src/transport/assets/wapi.js
      </a>
    ),
  },
  {
    label: 'Search the file for the literal string require("__debug").modulesMap',
    detail: "It is right there. That is the entry point.",
  },
  {
    label: "Search for WAWebAttachMediaCollection and sendClear",
    detail:
      "Hardcoded module names and method-signature heuristics. Everything else is built on top.",
  },
  {
    label: "Open issue #3317 and read the BROKEN_METHODS payload",
    detail: (
      <a
        href={OPENWA_3317}
        className="text-teal-700 underline"
        rel="noopener"
      >
        BROKEN METHODS: 2a745, January 2026
      </a>
    ),
  },
];

const faqItems = [
  {
    q: "Why does openwa break so often?",
    a: 'It does not talk to a stable API. It runs WhatsApp Web inside Puppeteer and injects a script (wapi.js) that pulls Meta\'s private webpack modules out of require("__debug").modulesMap, then matches them by hardcoded names like WAWebAttachMediaCollection or by checking which methods they expose. Every time Meta reships the WhatsApp Web bundle, those matches can silently miss, and the dependent APIs return undefined or throw a ProtocolError. The project ships a BROKEN_METHODS telemetry channel for exactly this case.',
  },
  {
    q: "Is openwa archived or deprecated?",
    a: 'No, the GitHub repo is active. But the npm latest tag has been pinned to 4.76.0 since 2026-02-19, with v5 still at 5.0.0-alpha.1 on the next tag. Recent work on master has shifted toward documentation and a v5 monorepo, while production users on v4 keep filing issues like #3326 ("ProtocolError - Promise was collected", April 2026) and #3317 ("BROKEN METHODS: Store.unfixable", January 2026).',
  },
  {
    q: "Is this just a Baileys problem too?",
    a: "It is a different fragility. Baileys speaks the binary WebSocket protocol directly, no browser. When WhatsApp changes its Noise handshake or multi-device key format, Baileys breaks at the connection layer. openwa breaks at the DOM and webpack layer because it lives inside WhatsApp Web. Both surfaces are private, both move. Baileys looks more stable in practice because it does not depend on hundreds of internal webpack module identifiers staying named.",
  },
  {
    q: "What does the BROKEN_METHODS feature actually do?",
    a: 'It is openwa\'s internal way of admitting a hook failed. When wapi.js cannot reattach a Store entry, the runtime records the failure and (depending on config) phones it home as {"BROKEN_METHODS": ["Store.unfixable"], "occurances": N}. Issue #3317 is a real instance from January 2026. The presence of the channel is the design admission: these hooks are expected to break, the project just wants telemetry on which ones.',
  },
  {
    q: "Can I just pin a version of openwa and avoid the breakage?",
    a: "You can pin the npm version, but you cannot pin the WhatsApp Web bundle. WhatsApp Web is downloaded fresh from web.whatsapp.com every time openwa boots its Puppeteer session. The library running on your machine never changes; the environment it executes in changes whenever Meta wants. Pinning openwa just pins how fast you fall behind.",
  },
  {
    q: "Does whatsapp-mcp-macos have the same problem?",
    a: "No, for one specific reason. It does not depend on any private internals of any WhatsApp client. It uses the macOS accessibility tree, which is a public, stable OS-level API that screen readers use. The dependencies it does have are honest: the desktop app must be running and accessibility permission must be granted. When that holds, sending a message is four UI moves, not a webpack scavenger hunt.",
  },
  {
    q: "What is the right tool then?",
    a: "Depends on the job. For headless server bots running on Linux, openwa or Baileys are still the realistic options, with the fragility tradeoff above. For automating your own WhatsApp account on a Mac, where you can keep the desktop app open, driving accessibility avoids the entire Meta-internal-surface problem and uses zero linked-device slots. For high-volume opted-in messaging with a verified sender, the WhatsApp Business Cloud API is the right tool.",
  },
];

const relatedPosts = [
  {
    title: "WhatsApp automation without the web protocol",
    href: "/t/whatsapp-automation-without-web-protocol",
    excerpt:
      "The general case behind this page: how the desktop-accessibility path avoids the WebSocket protocol and the headless-browser approach.",
    tag: "Guide",
  },
  {
    title: "The hidden risk of a self-hosted WhatsApp gateway",
    href: "/t/self-hosted-whatsapp-gateway-risk",
    excerpt:
      "Even when a Baileys-based gateway works, its auth_info folder is your account as a portable file. What that actually means.",
    tag: "Deep dive",
  },
  {
    title: "A WhatsApp API without a Meta Business account",
    href: "/t/whatsapp-without-business-api-ban",
    excerpt:
      "Three real options for programmatic WhatsApp, and which one ends in a banned number.",
    tag: "Guide",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "openwa and WhatsApp Web protocol fragility: where it actually breaks",
    description:
      "openwa drives WhatsApp Web through Puppeteer and injects a script that pulls Meta's private webpack modules out of require(\"__debug\").modulesMap, matched by hardcoded names. The project ships a BROKEN_METHODS telemetry pipe because those hooks snap on every Meta-side bundle reship.",
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

export default function OpenwaWhatsappWebProtocolFragilityPage() {
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
              openwa and the{" "}
              <GradientText>WhatsApp Web protocol</GradientText>: where the
              fragility actually lives
            </h1>
            <p className="text-base md:text-lg text-zinc-700 leading-relaxed mb-4">
              Every thread about openwa eventually says the same thing: it
              breaks a lot. That is true, and it is not vague. The fragility
              has a specific location in the codebase, a specific surface it
              depends on, and a feature inside openwa itself that exists
              because the maintainers know the dependency will not hold.
            </p>
            <p className="text-sm md:text-base text-zinc-500 leading-relaxed mb-8">
              Written for someone who landed here from a thread on a phone,
              wondering whether to wire openwa into something they care about.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="/install">
                See the no-protocol alternative
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
                Direct answer &mdash; verified 2026-05-19
              </p>
              <p className="text-lg md:text-xl text-zinc-900 font-semibold leading-snug mb-3">
                openwa is fragile because it does not talk to a protocol. It
                runs WhatsApp Web inside Puppeteer and pulls Meta&apos;s private
                webpack modules out of{" "}
                <code className="text-base bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
                  require(&quot;__debug&quot;).modulesMap
                </code>{" "}
                by hardcoded names.
              </p>
              <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
                Every Meta-side reship of the WhatsApp Web bundle can rename or
                restructure a hooked module and silently void the matching
                Store entry. The project ships a{" "}
                <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
                  BROKEN_METHODS
                </code>{" "}
                telemetry channel for exactly that case (see{" "}
                <a
                  href={OPENWA_3317}
                  className="text-teal-700 underline"
                  rel="noopener"
                >
                  issue #3317
                </a>
                ).
              </p>
            </div>
          </ShineBorder>
        </section>

        <div className="mt-10">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="7 min read"
          />
        </div>

        {/* Setting the stage */}
        <section className="max-w-3xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-5">
            What openwa actually is, under the marketing
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            openwa, formally{" "}
            <a
              href="https://www.npmjs.com/package/@open-wa/wa-automate"
              className="text-teal-700 underline"
              rel="noopener"
            >
              @open-wa/wa-automate
            </a>
            , is a Node library that automates a personal WhatsApp account. It
            does not implement WhatsApp&apos;s protocol the way Baileys does.
            Instead it boots a headless Chromium through Puppeteer, opens{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              web.whatsapp.com
            </code>
            , and drives the page from the outside.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            From WhatsApp&apos;s side, that browser is just a linked device,
            the same kind a normal user pairs on a laptop. The interesting code
            is not the browser, though. It is a script the library injects into
            the page, called wapi.js, which manufactures a global{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              window.Store
            </code>{" "}
            by reaching into WhatsApp Web&apos;s own webpack internals. That
            file is where every send, every read, every chat lookup comes from.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed">
            The npm{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              latest
            </code>{" "}
            tag has been pinned at 4.76.0 since 2026-02-19, and the v5 rewrite
            sits on the{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              next
            </code>{" "}
            tag at 5.0.0-alpha.1. The repository is active, but the production
            line on npm has been frozen for fifteen months while issues against
            it keep coming in.
          </p>
        </section>

        {/* The four layers of fragility */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            Four layers of fragility, in order
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-7">
            The fragility is not one thing. It is four dependencies stacked on
            top of each other, each on a surface that nobody outside Meta has
            promised to keep stable.
          </p>
          <StepTimeline steps={fragilityLayers} />
        </section>

        {/* The anchor code */}
        <section className="max-w-3xl mx-auto px-6 mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-3">
            The shape of the dependency, in code
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-6">
            Open{" "}
            <a
              href={OPENWA_WAPI}
              className="text-teal-700 underline"
              rel="noopener"
            >
              packages/core/src/transport/assets/wapi.js
            </a>{" "}
            on master and search for the literal string{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              require(&quot;__debug&quot;).modulesMap
            </code>
            . The block below is a faithful, slimmed-down version of what is
            there. Every line in it is a structural bet on a private interface.
          </p>
          <AnimatedCodeBlock
            code={wapiSnippet}
            language="javascript"
            filename="wapi.js (paraphrased from openwa master)"
          />
          <p className="text-sm text-zinc-500 leading-relaxed mt-4">
            The strings{" "}
            <code className="text-xs bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              WAWebAttachMediaCollection
            </code>
            ,{" "}
            <code className="text-xs bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              sendClear
            </code>
            , and{" "}
            <code className="text-xs bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              processFiles
            </code>{" "}
            are not contracts. They are observations that held the day the
            heuristic was written. WhatsApp owes nobody those names.
          </p>
        </section>

        {/* The self-reporting telemetry */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            The project tells on itself: BROKEN_METHODS
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-6">
            The clearest signal that the dependency is unstable is not the
            issue tracker. It is the fact that openwa carries its own
            broken-hooks telemetry pipe. When a hook fails to reattach after a
            bundle reship, the runtime emits a structured payload with the
            failure. Issue{" "}
            <a
              href={OPENWA_3317}
              className="text-teal-700 underline"
              rel="noopener"
            >
              #3317
            </a>{" "}
            is a real instance of that payload firing in production in January
            2026 with Store.unfixable, nine times.
          </p>
          <TerminalOutput
            title="openwa, in real production deployments"
            lines={brokenMethodsLog}
          />
          <p className="text-sm text-zinc-500 leading-relaxed mt-4">
            Two real, current symptoms side by side. The top half is the
            symptom reporters notice (a sendText call returns ProtocolError
            even though the message is delivered, per{" "}
            <a
              href={OPENWA_3326}
              className="text-teal-700 underline"
              rel="noopener"
            >
              issue #3326
            </a>
            ). The bottom half is the architectural admission underneath it.
          </p>
        </section>

        {/* Why pinning does not help */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-5">
            Why pinning the npm version does not save you
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            The instinct, when a dependency is unstable, is to pin it. With
            openwa, pinning the npm version pins the Node side of the bot. It
            does not pin the WhatsApp Web bundle that wapi.js runs inside.
            That bundle is shipped from{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              web.whatsapp.com
            </code>{" "}
            fresh on every boot of the Puppeteer session.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            The Node library is the part you control. The runtime environment
            is the part Meta controls. Pinning only the Node library means the
            distance between your code and the live web bundle grows every
            time Meta ships, and at some unannounced moment a module hook
            stops matching and the dependent API turns into undefined.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed">
            This is also why the v4 maintenance line on the latest tag has not
            moved in fifteen months. The interface it was written against has
            moved, but the npm package cannot ship those updates without a new
            release, and there has not been one.
          </p>
        </section>

        {/* Comparison */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            openwa vs. driving the desktop app directly
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-7">
            Same goal: programmatic WhatsApp from your own account. Different
            surface to depend on. The honest difference is what each one is
            betting on Meta not changing.
          </p>
          <ComparisonTable
            productName="Desktop accessibility (WhatsApp MCP)"
            competitorName="openwa (WhatsApp Web via Puppeteer)"
            rows={compareRows}
            caveat="openwa wins on cross-platform and headless. If you need a Linux server-side bot with no Mac in the loop, the desktop-accessibility path does not apply. It is not a like-for-like swap, it is a different shape of dependency."
          />
        </section>

        {/* Verify it yourself */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-5">
            Verify any of this yourself in four minutes
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-6">
            None of the claims above need to be taken on trust. The code is
            public and the issues are public. The four pointers below are the
            shortest path to seeing the architecture for yourself.
          </p>
          <ol className="space-y-4">
            {verifyChecklist.map((step, i) => (
              <li
                key={i}
                className="rounded-xl border border-zinc-200 bg-white p-5"
              >
                <div className="flex items-start gap-3 mb-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-50 text-teal-700 text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-base font-semibold text-zinc-900 leading-snug">
                    {step.label}
                  </p>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed pl-9">
                  {step.detail}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Footer CTA */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <BookCallCTA
            appearance="footer"
            destination={CAL_LINK}
            site="WhatsApp MCP"
            heading="Stuck choosing between fragile and Business API?"
            description="Talk it through with the person who built the desktop-accessibility path before you pick one."
          />
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
            Questions people ask before committing to openwa
          </h2>
          <FaqSection items={faqItems} heading="" />
        </section>

        {/* Related */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
        </section>

        {/* Acknowledgements */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
            <p className="text-sm text-zinc-700 leading-relaxed">
              <span className="font-semibold text-zinc-900">
                Credit where it is due.
              </span>{" "}
              openwa is an impressive piece of reverse engineering and the
              maintainers have kept it alive for years on a surface nobody
              promised them. This page is not a takedown of the project, it is
              an honest account of the architecture, written for someone
              choosing what to depend on. If you need a Linux-headless WhatsApp
              bot,{" "}
              <a
                href={OPENWA_REPO}
                className="text-teal-700 underline"
                rel="noopener"
              >
                the project
              </a>{" "}
              is still one of the realistic options.
            </p>
          </div>
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination={CAL_LINK}
        site="WhatsApp MCP"
        description="Questions about openwa vs the desktop-accessibility path? Book a quick call."
      />
    </>
  );
}
