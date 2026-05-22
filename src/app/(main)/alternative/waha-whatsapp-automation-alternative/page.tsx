import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  GradientText,
  BackgroundGrid,
  ShimmerButton,
  ShineBorder,
  AnimatedBeam,
  AnimatedCodeBlock,
  ComparisonTable,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/alternative/waha-whatsapp-automation-alternative";
const PUBLISHED = "2026-05-22";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";
const GITHUB = "https://github.com/m13v/whatsapp-mcp-macos";
const WAHA_SITE = "https://waha.devlike.pro/";
const WAHA_REPO = "https://github.com/devlikeapro/waha";
const WAHA_ENGINES = "https://waha.devlike.pro/docs/how-to/engines/";
const NOWEB_BAILEYS = "https://github.com/devlikeapro/Baileys";
const WWEBJS = "https://github.com/pedroslopez/whatsapp-web.js";

export const metadata: Metadata = {
  title: "WAHA alternative that skips the web protocol entirely",
  description:
    "WAHA lets you pick an engine: WEBJS, NOWEB, or GOWS. All three are reverse-engineered WhatsApp clients that pair a linked device and sit on Meta's detection surface. WhatsApp MCP for macOS is the alternative that runs no engine at all: it drives the official desktop app through macOS Accessibility APIs. No Docker, no linked device, no socket to WhatsApp servers.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "WAHA alternative that skips the web protocol entirely",
    description:
      "Every WAHA engine is a reverse-engineered WhatsApp client. WhatsApp MCP drives the genuine desktop app via macOS Accessibility instead. No engine, no linked device, no socket.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "A WAHA alternative that isn't a WhatsApp client at all",
    description:
      "WAHA's WEBJS/NOWEB/GOWS engines all pair a linked device on Meta's detection surface. WhatsApp MCP drives the real desktop app via macOS accessibility instead.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "WAHA alternative (no web protocol)" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "WAHA alternative (no web protocol)", url: PAGE_URL },
];

const dockerVsNpm = `# WAHA: a Docker container that runs a reverse-engineered client.
# You pick an engine, scan a QR, and pair a linked device.
docker run -it --rm -p 3000:3000 devlikeapro/waha
# WAHA_DEFAULT_ENGINE=NOWEB   -> ships a Baileys fork, WebSocket to WhatsApp
# WAHA_DEFAULT_ENGINE=WEBJS   -> whatsapp-web.js, headless Chrome + Puppeteer
# WAHA_DEFAULT_ENGINE=GOWS    -> a Golang WebSocket client
# Whichever you pick, your container becomes a linked device on the account.

# WhatsApp MCP: no container, no engine, no linked device.
# It drives the WhatsApp app you already have signed in.
npm install -g whatsapp-mcp-macos
# grant Accessibility permission once, point your MCP client at it.
# The only socket to WhatsApp is the one the official app already opened.`;

const comparisonRows = [
  {
    feature: "What talks to WhatsApp",
    competitor:
      "The engine you pick. WEBJS drives whatsapp-web.js in headless Chrome; NOWEB runs a Baileys fork over WebSocket; GOWS is a Golang WebSocket client. Each is a reverse-engineered client.",
    ours:
      "Nothing new. The genuine WhatsApp desktop app is the only client. WhatsApp MCP reads its accessibility tree and posts clicks and keystrokes.",
  },
  {
    feature: "Linked device on your account",
    competitor:
      "Yes. Each session scans a QR and pairs a linked device, spending one of your four slots on a client Meta did not ship.",
    ours: "None. It drives the desktop app that is already linked. Nothing new pairs.",
  },
  {
    feature: "Detection surface",
    competitor:
      "On it. The engine's socket or browser session is exactly what Meta's anti-automation models score. Ban risk is real, especially on new numbers.",
    ours:
      "Off it. No socket leaves the process. From Meta's side there is one genuine desktop session, the one you already use.",
  },
  {
    feature: "Where it runs",
    competitor:
      "Anywhere Docker runs. Linux VPS, container, ARM box. Portability is the whole point.",
    ours:
      "macOS only (macOS 13+). It depends on the WhatsApp Catalyst app and the macOS Accessibility framework. No headless, no container.",
  },
  {
    feature: "Setup",
    competitor:
      "docker run, expose port 3000, scan a QR, wire up webhooks. Plus a license for multi-session.",
    ours:
      "npm install -g whatsapp-mcp-macos, grant Accessibility permission once, add a stdio entry to your MCP host.",
  },
  {
    feature: "Throughput",
    competitor:
      "High on paper. Hundreds per minute per session, bounded in practice by ban risk.",
    ours:
      "About 15 messages per minute per Mac. Strictly serial; it is typing into one focused window.",
  },
  {
    feature: "How an agent calls it",
    competitor:
      "Your code calls a REST endpoint and parses JSON; inbound arrives on a webhook you host.",
    ours:
      "An MCP server over stdio. Claude, Cursor, or Windsurf call the 11 tools directly. No HTTP surface to host.",
  },
  {
    feature: "Honest fit",
    competitor:
      "Multi-tenant SaaS, Linux deployments, disposable numbers, high-volume outbound where ban risk is priced in.",
    ours:
      "One human (or one agent for one human) on a Mac, sending the messages they would normally send from their personal account.",
  },
];

const faqItems = [
  {
    q: "What is WAHA actually doing under the hood?",
    a: "WAHA is a Node.js application that wraps community WhatsApp libraries behind one REST API and webhook interface. You choose an engine: WEBJS uses whatsapp-web.js driving a real WhatsApp Web session in headless Chrome via Puppeteer; NOWEB talks to WhatsApp over a WebSocket using a fork of Baileys (github.com/devlikeapro/Baileys); GOWS is a newer Golang WebSocket client. Whichever you pick, your WAHA container authenticates by scanning a QR and becomes a linked device on the account. That linked device, and its socket or browser session, is what speaks the WhatsApp web protocol on your behalf.",
  },
  {
    q: "How is WhatsApp MCP an alternative if WAHA can run on Linux and this is macOS only?",
    a: "It is an alternative on architecture, not on deployment target. WAHA's value is that any engine talks the web protocol so it can run headless anywhere. The cost is that your account carries a reverse-engineered linked device that Meta can detect and ban. WhatsApp MCP makes the opposite trade: it never becomes a client, so there is nothing on the protocol layer for Meta to flag, but it needs a real macOS session with the desktop app open. If your blocker is 'I do not want my personal number on a bannable linked device,' this is the alternative. If your blocker is 'I need a headless Linux container,' WAHA (or Meta's Cloud API) is the right tool and this page says so plainly.",
  },
  {
    q: "Does switching WAHA from WEBJS to NOWEB or GOWS lower the ban risk?",
    a: "Not structurally. The engines differ on resource use and stability: WEBJS runs a full headless Chrome (heavy), while NOWEB and GOWS skip the browser and talk WebSocket directly (lighter). But all three authenticate as a linked device and put a non-official client on your account. The thing Meta's anti-automation models score is the linked-device session itself, not which library produced it. Picking GOWS over WEBJS changes your CPU bill, not which side of the detection surface your account lives on.",
  },
  {
    q: "What can WhatsApp MCP read that NOWEB disables by default?",
    a: "WAHA's NOWEB engine disables getting all contacts, retrieving all chats, and accessing chat message history by default; you have to enable a store at session creation, and the docs warn that changing store config after the QR scan can lose chat history. WhatsApp MCP has no store and no protocol-level history problem. It reads whatever the WhatsApp app has rendered: it walks the accessibility tree (the same data macOS exposes to VoiceOver), parses chat rows, sender, text, and timestamps, and returns them. The limit is the opposite kind: it only sees messages currently rendered on screen, not the full server-side history a protocol client could page through.",
  },
  {
    q: "Will using WhatsApp MCP get my number banned the way a WAHA engine can?",
    a: "The usual ban trigger for unofficial automation, a reverse-engineered client handshake, is simply not present, because the only client on your account is the genuine Meta-signed desktop app. There is no engine, no linked device, no socket from this process. That said, account-level activity still matters on any path: mass-messaging strangers or robotic timing can draw enforcement no matter how the typing happens. Keep volume human and stay within WhatsApp's consumer terms at https://www.whatsapp.com/legal/terms-of-service.",
  },
  {
    q: "WAHA has webhooks for inbound. Does WhatsApp MCP?",
    a: "No webhook server, by design. WAHA pushes inbound events to an HTTPS endpoint you host. WhatsApp MCP is a stdio MCP server with no inbound network surface; your agent reads new messages by calling whatsapp_list_chats or whatsapp_read_messages on demand. That is a worse fit for an always-on event pipeline and a better fit for an agent that triages your inbox when you ask it to. Pick by whether you need push or pull.",
  },
  {
    q: "Can I run both? WAHA for some accounts and WhatsApp MCP for my personal one?",
    a: "Yes, and it is a sensible split. Point one MCP entry at the local accessibility server for your personal account (drafting replies, reading group chats, triage) and run WAHA in Docker for disposable or business-shaped numbers where ban risk is acceptable. The two target different sending identities and volume profiles, so they do not step on each other. There is a deeper architecture breakdown at /alternative/self-hosted-whatsapp-gateway-vs-accessibility-apis on this site.",
  },
];

const jsonLd = [
  articleSchema({
    headline: "WAHA alternative that skips the web protocol entirely",
    description:
      "WAHA lets you pick an engine (WEBJS, NOWEB, GOWS), but all three are reverse-engineered WhatsApp clients that pair a linked device and sit on Meta's detection surface. WhatsApp MCP for macOS runs no engine: it drives the official desktop app through macOS Accessibility APIs, with no Docker, no linked device, and no socket to WhatsApp servers. The article verifies that WAHA's NOWEB engine ships a fork of Baileys and disables get-all-contacts, get-all-chats, and message history by default.",
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

export default function WahaAlternativePage() {
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
              WAHA alternative
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.12]">
              A WAHA alternative that{" "}
              <GradientText>isn&apos;t a WhatsApp client at all</GradientText>
            </h1>
            <p className="text-base md:text-lg text-zinc-700 leading-relaxed mb-4">
              WAHA&apos;s pitch is that you pick an engine: WEBJS, NOWEB, or
              GOWS, all behind one tidy REST API. The part the comparisons skip
              is that every one of those engines is a reverse-engineered
              WhatsApp client that pairs a linked device and lives on the surface
              Meta uses to detect automation. If you went looking for a WAHA
              alternative because of that, here is one that runs no engine at
              all.
            </p>
            <p className="text-sm md:text-base text-zinc-500 leading-relaxed mb-8">
              Written for someone who landed here from a thread, is on a Mac, and
              wants the honest trade before swapping anything out.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="/install">See the no-engine path</ShimmerButton>
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
                Direct answer &mdash; verified 2026-05-22
              </p>
              <p className="text-lg md:text-xl text-zinc-900 font-semibold leading-snug mb-3">
                The alternative that skips the web protocol is to drive the
                official desktop app instead of running an engine that pretends
                to be one.
              </p>
              <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
                <a href={GITHUB} className="text-teal-700 underline">
                  whatsapp-mcp-macos
                </a>{" "}
                reads the macOS accessibility tree of the WhatsApp app on your
                Mac and posts synthetic clicks and keystrokes. No Docker, no
                engine, no QR pairing, no socket to WhatsApp servers. The trade
                versus{" "}
                <a href={WAHA_SITE} className="text-teal-700 underline">
                  WAHA
                </a>
                : macOS only, the desktop app has to be running, around 15
                messages per minute, and text only. In return your number never
                carries a bannable linked device.
              </p>
            </div>
          </ShineBorder>
        </section>

        <div className="max-w-3xl mx-auto px-6 mt-10">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="7 min read"
          />
        </div>

        {/* Engines = clients */}
        <section className="max-w-3xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-5">
            WAHA&apos;s three engines are three reverse-engineered clients
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            WAHA is a Node.js application that wraps community WhatsApp libraries
            behind one consistent REST API and webhook interface. The{" "}
            <a href={WAHA_ENGINES} className="text-teal-700 underline">
              engines page
            </a>{" "}
            lays out the choice:
          </p>
          <ul className="space-y-3 text-sm md:text-base text-zinc-700 mb-4">
            <li>
              <span className="font-semibold text-zinc-900">WEBJS</span> uses{" "}
              <a href={WWEBJS} className="text-teal-700 underline">
                whatsapp-web.js
              </a>{" "}
              and runs a real WhatsApp Web session inside headless Chrome via
              Puppeteer.
            </li>
            <li>
              <span className="font-semibold text-zinc-900">NOWEB</span> drops
              the browser and talks to WhatsApp over a WebSocket using a fork of{" "}
              <a href={NOWEB_BAILEYS} className="text-teal-700 underline">
                Baileys
              </a>
              .
            </li>
            <li>
              <span className="font-semibold text-zinc-900">GOWS</span> is a
              newer Golang WebSocket client, positioned as the future
              replacement for NOWEB.
            </li>
          </ul>
          <p className="text-base text-zinc-700 leading-relaxed">
            The engine swap changes your resource bill and stability, not your
            relationship with Meta. Every engine authenticates the same way:
            scan a QR, become a linked device on the account, and speak the
            WhatsApp web protocol from then on. The linked-device session is
            exactly what Meta&apos;s anti-automation models watch. Picking GOWS
            over WEBJS is a CPU decision, not a ban-risk decision.
          </p>
        </section>

        {/* Beam */}
        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4 max-w-3xl mx-auto">
            Where the socket ends up
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-8 max-w-3xl mx-auto">
            Same outcome, a message reaches a recipient. The difference is who
            owns the socket talking to WhatsApp servers. With WAHA, your
            container owns it. With the accessibility path, the official app owns
            it, exactly as it does for a normal user.
          </p>
          <AnimatedBeam
            title="Two ways to reach WhatsApp"
            hub={{
              label: "WhatsApp servers",
              sublabel: "web protocol over WebSocket",
            }}
            from={[
              {
                label: "WAHA + WEBJS",
                sublabel: "headless Chrome, linked device",
              },
              {
                label: "WAHA + NOWEB",
                sublabel: "Baileys fork, linked device",
              },
              {
                label: "WAHA + GOWS",
                sublabel: "Golang WebSocket, linked device",
              },
            ]}
            to={[
              {
                label: "WhatsApp Desktop app",
                sublabel: "official client on the Mac",
              },
              {
                label: "WhatsApp MCP server",
                sublabel: "reads/writes the app via macOS AX, no socket",
              },
              {
                label: "Your MCP host",
                sublabel: "Claude, Cursor, Windsurf over stdio",
              },
            ]}
          />
          <p className="text-sm text-zinc-600 leading-relaxed mt-6 max-w-3xl mx-auto">
            Left: each WAHA engine owns a session pretending to be a client, and
            that is the thing Meta scores. Right: the desktop app owns the only
            socket on the machine; the MCP server only touches the app&apos;s
            window, never the network.
          </p>
        </section>

        {/* Anchor fact + code */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            The anchor fact: NOWEB even disables reading your own data
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            Because a WAHA engine is a protocol client, it inherits the
            protocol&apos;s constraints. WAHA&apos;s NOWEB engine{" "}
            <a
              href="https://waha.devlike.pro/docs/engines/noweb/"
              className="text-teal-700 underline"
            >
              disables
            </a>{" "}
            getting all contacts, retrieving all chats, and accessing chat
            message history by default. You have to opt into a &quot;store&quot;
            at session creation, and the docs warn that changing the store
            config after the QR scan can lose chat history.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed mb-6">
            The accessibility path has the opposite shape. There is no store and
            no protocol history toggle. It reads whatever the WhatsApp app has
            rendered, the same data macOS exposes to VoiceOver, and parses chat
            rows, sender, text, and timestamps straight off the screen. Its limit
            is the honest inverse: it sees only messages currently rendered, not
            the full server-side history a protocol client could page through.
          </p>
          <AnimatedCodeBlock
            code={dockerVsNpm}
            language="bash"
            filename="WAHA engine vs WhatsApp MCP, side by side"
          />
          <p className="text-sm text-zinc-500 leading-relaxed mt-4">
            Verify it yourself: WAHA&apos;s engine choice is documented at{" "}
            <a href={WAHA_ENGINES} className="text-teal-700 underline">
              waha.devlike.pro/docs/how-to/engines
            </a>
            , the NOWEB Baileys fork is at{" "}
            <a href={NOWEB_BAILEYS} className="text-teal-700 underline">
              github.com/devlikeapro/Baileys
            </a>
            , and the no-engine path is one Swift file in{" "}
            <a href={GITHUB} className="text-teal-700 underline">
              github.com/m13v/whatsapp-mcp-macos
            </a>
            .
          </p>
        </section>

        {/* Comparison table */}
        <section className="max-w-5xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3 max-w-3xl mx-auto">
            WAHA vs WhatsApp MCP, row by row
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-7 max-w-3xl mx-auto">
            Both are real, in-production tools. Neither replaces the other; they
            sit on opposite sides of one decision, whether your process becomes a
            WhatsApp client.
          </p>
          <ComparisonTable
            productName="WhatsApp MCP (macOS accessibility)"
            competitorName="WAHA (WEBJS / NOWEB / GOWS engines)"
            rows={comparisonRows}
            caveat="WAHA wins clearly on headless deployment, cross-platform, throughput, and inbound webhooks. If you need a Linux container sending business-shaped volume, it is the better tool. The accessibility path trades all of that for one thing: your account never carries a client Meta can flag."
          />
        </section>

        {/* When WAHA wins */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
            When you should just use WAHA
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            WAHA is a genuinely good piece of software, and there are cases where
            it is the right answer and this is not. If you need a headless Linux
            or Docker deployment with no Mac in the loop, the accessibility path
            does not exist for you. If you are running multi-tenant SaaS, sending
            from disposable or business numbers where ban risk is priced in, or
            you need an inbound webhook pipeline and hundreds-per-minute
            throughput, WAHA&apos;s engine model is built for exactly that.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed">
            The honest framing: treat any WAHA-engine account as disposable.
            Plan for the case where it logs out, design a re-pair path, and never
            run it on the personal number you cannot afford to lose. There is a
            deeper architecture breakdown across Baileys, Evolution API, and
            wppconnect at{" "}
            <a
              href="/alternative/self-hosted-whatsapp-gateway-vs-accessibility-apis"
              className="text-teal-700 underline"
            >
              self-hosted gateway vs accessibility APIs
            </a>
            .
          </p>
        </section>

        {/* When MCP wins */}
        <section className="max-w-3xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
            When the no-engine path is the better swap
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            One human, or one AI agent acting for one human, sending
            conversational messages to known contacts from a Mac that already has
            WhatsApp Desktop signed in. Solo founders routing inbound from their
            personal WhatsApp. An agent triaging your group chats overnight.
            Personal-account automation you would never put on a WAHA engine
            because the number matters too much.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed">
            The pull here is removed surface, not feature parity. No engine
            choice. No QR re-pair flow. No anti-ban middleware. No webhook server
            to host. No second number to keep alive. Your agent reads from and
            writes to the same WhatsApp app you already use, with synchronous
            confirmation that the message bubble appeared, and the only
            operational concern is granting Accessibility permission to the right
            binary. The full walkthrough lives on{" "}
            <a href="/install" className="text-teal-700 underline">
              the install page
            </a>
            , and the architectural deep dive is at{" "}
            <a
              href="/t/whatsapp-automation-without-web-protocol"
              className="text-teal-700 underline"
            >
              WhatsApp automation without the web protocol
            </a>
            .
          </p>
        </section>

        {/* Footer CTA */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <BookCallCTA
            appearance="footer"
            destination={CAL_LINK}
            site="WhatsApp MCP"
            heading="Stuck between a WAHA engine and a Mac?"
            description="If your use case is on the line between a self-hosted engine and the no-client path, talk it through with the person who built the accessibility server."
          />
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
            Questions people ask when leaving WAHA
          </h2>
          <FaqSection items={faqItems} />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination={CAL_LINK}
        site="WhatsApp MCP"
        description="Weighing a WAHA engine against the no-client path? Book a quick call."
      />
    </>
  );
}
