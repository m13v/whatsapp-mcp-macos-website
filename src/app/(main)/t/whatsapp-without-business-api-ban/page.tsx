import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  GradientText,
  ShimmerButton,
  RemotionClip,
  GlowCard,
  BentoGrid,
  SequenceDiagram,
  TerminalOutput,
  AnimatedCodeBlock,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/whatsapp-without-business-api-ban";
const PUBLISHED = "2026-05-18";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";
const META_GET_STARTED =
  "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started";
const GITHUB = "https://github.com/m13v/whatsapp-mcp-macos";
const BAILEYS = "https://github.com/WhiskeySockets/Baileys";

export const metadata: Metadata = {
  title:
    "WhatsApp API without a Meta Business account: 3 options (one gets you banned)",
  description:
    "No official WhatsApp API works without a Meta Business account. The unofficial APIs that skip Meta link a reverse-engineered client device and get numbers banned in 2 to 8 weeks. A third path drives the genuine WhatsApp Desktop app via macOS accessibility and never connects to WhatsApp servers as a client at all.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "WhatsApp API without a Meta Business account: the three real options",
    description:
      "There is no official no-Meta API. The unofficial ones link a forged client and trip ban sweeps. The third path is not a WhatsApp API client at all.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp without the Business API: three doors, one ban risk",
    description:
      "Why unofficial WhatsApp APIs ban your number, and the path that drives the real desktop app instead of impersonating a client.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "WhatsApp API without a Meta Business account" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "WhatsApp API without a Meta Business account", url: PAGE_URL },
];

const doors = [
  {
    title: "Door 1 — the official Business Platform",
    description:
      "The Cloud API and the on-premises Business API it is replacing. Both require a Meta Business Portfolio and a WhatsApp Business Account before you can send one message. Setup runs days to weeks, outbound is gated behind pre-approved templates. It does not skip the Meta Business account. It is the Meta Business account.",
  },
  {
    title: "Door 2 — an unofficial reverse-engineered API",
    description:
      "Baileys, whatsapp-web.js, Evolution API and similar projects skip Meta entirely. They re-implement the WhatsApp protocol and link themselves to your number as a brand-new device. Minutes to set up, no templates, no approval. Also a documented ban risk: accounts commonly last 2 to 8 weeks before a permanent ban.",
  },
  {
    title: "Door 3 — drive the desktop app you already use",
    description:
      "Skip the API question. The official WhatsApp Desktop app is already signed in on your Mac. Automate it from outside with macOS accessibility APIs. No Meta Business account, no API key, and no new linked device, because nothing new ever connects to WhatsApp servers.",
    accent: true,
  },
];

const banSequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "QR scan pairs your account, issues device keys",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "Desktop app connects: signed, recognized build",
    type: "response" as const,
  },
  {
    from: 3,
    to: 1,
    label: "Unofficial API connects as its own linked device",
    type: "request" as const,
  },
  {
    from: 1,
    to: 3,
    label: "Handshake + traffic match no real WhatsApp client",
    type: "error" as const,
  },
  {
    from: 1,
    to: 0,
    label: "Number flagged, then banned in the next sweep",
    type: "error" as const,
  },
];

const grepLines = [
  {
    text: "grep -rn 'URLSession\\|Network\\|websocket' Sources/",
    type: "command" as const,
  },
  { text: "(no matches)", type: "output" as const },
  {
    text: "the MCP server has no networking code at all",
    type: "info" as const,
  },
  {
    text: "grep -n '^import' Sources/WhatsAppMCP/main.swift",
    type: "command" as const,
  },
  { text: "import MCP", type: "output" as const },
  { text: "import Foundation", type: "output" as const },
  { text: "import CoreGraphics", type: "output" as const },
  { text: "import ApplicationServices", type: "output" as const },
  { text: "import AppKit", type: "output" as const },
  { text: "import MacosUseSDK", type: "output" as const },
  {
    text: "ApplicationServices = accessibility APIs. CoreGraphics = mouse + key events.",
    type: "info" as const,
  },
  {
    text: "nothing here talks to WhatsApp servers. the official app does.",
    type: "success" as const,
  },
];

const mcpConfig = `{
  "mcpServers": {
    "whatsapp": {
      "type": "stdio",
      "command": "whatsapp-mcp",
      "args": [],
      "env": {}
    }
  }
}`;

const faqItems = [
  {
    q: "Is there any official WhatsApp API that does not need a Meta Business account?",
    a: "No. Both the WhatsApp Cloud API and the older on-premises Business API run on the WhatsApp Business Platform, and the Platform requires a Meta Business Portfolio plus a WhatsApp Business Account before you can send a single message. Meta's own get-started documentation walks you through attaching a business portfolio as a required step. If a provider claims an official API with no Meta business setup, they are almost always a Business Solution Provider quietly creating that account on your behalf, or they are reselling an unofficial path.",
  },
  {
    q: "Do unofficial WhatsApp APIs actually get your number banned?",
    a: "Yes, and it is well documented. Tools like Baileys, whatsapp-web.js and Evolution API re-implement the WhatsApp protocol and link to your number as a new device. WhatsApp detects them through protocol fingerprinting, message velocity patterns and behavioural analysis. Accounts using these tools commonly survive 2 to 8 weeks before a permanent ban, and ban sweeps tend to land every few months when WhatsApp updates detection. The Baileys issue tracker has long-running threads of users reporting bans, including bots that ran cleanly for years before a sweep caught them.",
  },
  {
    q: "Why does automating the desktop app not trip the same ban detection?",
    a: "Because it is not a WhatsApp client. An unofficial API is a program that connects to WhatsApp servers and pretends to be a real client. Door 3 never connects to WhatsApp servers. It drives the genuine, App-Store-signed WhatsApp Desktop app from outside, using macOS accessibility APIs to read the screen and CGEvent to move the mouse and type. The only thing on the wire to Meta is Meta's own binary, with its own real fingerprint. There is no forged handshake for detection to catch.",
  },
  {
    q: "Does the MCP server add a new linked device to my WhatsApp account?",
    a: "No. WhatsApp lets you link up to four companion devices to your phone. The WhatsApp Desktop app is one of those companion devices, and you approved it yourself with a QR scan. The MCP server adds zero additional linked devices, because it is not a device. Open WhatsApp settings, look at the linked devices list, and the count stays exactly where it was. An unofficial API, by contrast, consumes one of those four slots and shows up there as an extra entry.",
  },
  {
    q: "Can I use the desktop-automation path for high-volume marketing broadcasts?",
    a: "No, and you should not try. Door 3 sends at human scale: one message at a time, into chats you open, on the account you already use. High-volume opt-in broadcasts, template messaging and a verified sender badge are exactly what the official Cloud API exists for. If your use case is a marketing blast to thousands of numbers, the honest answer is to go through Door 1 and accept the Meta Business account. The desktop path is for personal accounts, founders routing inbound, and AI agents that need real WhatsApp reach.",
  },
  {
    q: "What does the desktop-automation path actually require?",
    a: "macOS 13 or later, the WhatsApp Desktop app installed from the Mac App Store and signed in, and Accessibility permission granted to whichever app runs the MCP server (Claude Code, Terminal, or similar). It installs as an npm package with one command. There are no API keys, no webhook URL and no Meta developer account anywhere in the setup. The config block has an empty env object, and that is not a placeholder.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "WhatsApp API without a Meta Business account: three options, one ban risk",
    description:
      "No official WhatsApp API works without a Meta Business account. Unofficial APIs that skip Meta link a reverse-engineered client device and get numbers banned in 2 to 8 weeks. A third path drives the genuine WhatsApp Desktop app via macOS accessibility and is not a WhatsApp API client at all.",
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

export default function WhatsappWithoutBusinessApiBanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen pb-24">
        <div className="max-w-3xl mx-auto px-6 pt-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-10">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
            guide
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.12]">
            A WhatsApp API <GradientText>without a Meta Business account</GradientText>?
          </h1>
          <p className="text-base md:text-lg text-zinc-700 leading-relaxed mb-4">
            There is no official one. Every path that skips the Meta Business
            account is either an unofficial API that gets your number banned, or
            something that is not an API at all. This page lays out the three
            real options and shows exactly why one of them ends in a ban.
          </p>
          <p className="text-sm md:text-base text-zinc-500 leading-relaxed mb-8">
            Written for someone who landed here from a thread, wants the honest
            version, and is on a Mac.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <ShimmerButton href="/install">See the no-Meta path</ShimmerButton>
            <a
              href={GITHUB}
              className="text-sm font-medium text-teal-700 hover:text-teal-600"
            >
              source on GitHub &rarr;
            </a>
          </div>
        </section>

        {/* Concept reveal */}
        <div className="max-w-3xl mx-auto px-6 mt-12">
          <RemotionClip
            title="WhatsApp without the Business API"
            subtitle="three doors, one ban risk"
            accent="teal"
            durationInFrames={300}
            captions={[
              "You want WhatsApp programmatically. You want to skip Meta's Business setup.",
              "Door 1: the official API still requires a Meta Business account.",
              "Door 2: an unofficial API skips Meta by linking a reverse-engineered device.",
              "Forged client fingerprint. Banned in the next sweep, 2 to 8 weeks.",
              "Door 3: drive the real desktop app from the OS. No new client at all.",
            ]}
          />
        </div>

        <div className="mt-10">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="7 min read"
          />
        </div>

        {/* Direct answer */}
        <section className="max-w-3xl mx-auto px-6 mt-12">
          <GlowCard>
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-teal-700 mb-3">
                Direct answer, verified 2026-05-18
              </p>
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mb-4">
                No. There is no official WhatsApp API that works without a Meta
                Business account.
              </h2>
              <p className="text-zinc-700 leading-relaxed mb-3">
                Both the WhatsApp Cloud API and the on-premises Business API it
                is replacing run on the WhatsApp Business Platform, and the
                Platform requires a Meta Business Portfolio plus a WhatsApp
                Business Account before your first message. Meta&rsquo;s own{" "}
                <a
                  href={META_GET_STARTED}
                  className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                >
                  Cloud API get-started guide
                </a>{" "}
                makes attaching a business portfolio a required step.
              </p>
              <p className="text-zinc-700 leading-relaxed">
                The only ways to skip that Meta account are (a) unofficial APIs
                that reverse-engineer the WhatsApp protocol, which carry a
                documented ban risk, or (b) automating the genuine WhatsApp
                Desktop app from outside the app, which is not a WhatsApp API
                client at all. The rest of this page is about which of those
                two you actually want.
              </p>
            </div>
          </GlowCard>
        </section>

        {/* The three doors */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
            Three doors, and the search hides one of them
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-2">
            Most guides on this topic present a clean binary: the official API
            (slow, needs Meta) versus an unofficial API (fast, no Meta). They
            mention bans in a single sentence and move on. That binary is
            missing a door, and it understates how the middle one fails.
          </p>
          <BentoGrid cards={doors} />
        </section>

        {/* Why door 2 bans you */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
            Door 2 is the one that bans your number
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            An unofficial API does not have a secret blessed channel into
            WhatsApp. It works by re-implementing the WhatsApp multi-device
            protocol from scratch and linking itself to your number as a new
            companion device. From WhatsApp&rsquo;s side, a fifth client just
            appeared, and it does not match the handshake, version string or
            traffic shape of any build Meta actually ships.
          </p>
          <SequenceDiagram
            title="how a number gets flagged"
            actors={[
              "Your phone",
              "WhatsApp servers",
              "Official desktop app",
              "Unofficial API",
            ]}
            messages={banSequenceMessages}
          />
          <p className="text-zinc-700 leading-relaxed mb-4">
            WhatsApp detects these clients through protocol fingerprinting,
            message velocity patterns and behavioural analysis. The result is
            consistent across the open-source ecosystem: accounts running on
            tools like{" "}
            <a
              href={BAILEYS}
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              Baileys
            </a>
            , whatsapp-web.js and Evolution API commonly last 2 to 8 weeks
            before a permanent ban, and ban sweeps tend to land every few
            months as detection is updated. The Baileys issue tracker is full
            of these reports, including bots that ran cleanly for years before
            a single sweep took them out.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            This is the part the &ldquo;use it responsibly to avoid bans&rdquo;
            footnote glosses over. The ban is not a punishment for sending too
            fast. The connection itself is the violation: an unofficial API is
            a non-WhatsApp client speaking the WhatsApp protocol, and that is
            exactly what the detection is built to find. Slowing your send rate
            does not change the fingerprint.
          </p>
        </section>

        {/* Door 3 - the anchor */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
            Door 3: stop being a client
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The reason Door 2 fails is that it tries to be a WhatsApp client.
            Door 3 refuses the premise. You already have a real, App-Store-signed
            WhatsApp client running on your Mac: the WhatsApp Desktop app, signed
            in, sitting one companion-device slot deep. Instead of building a
            new client, you automate that one from outside, the same way a
            screen reader does.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            That is what{" "}
            <a
              href={GITHUB}
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              whatsapp-mcp-macos
            </a>{" "}
            does, and you do not have to take my word for it. Clone the repo
            and grep the source. The entire server is one Swift file, and its
            networking surface to WhatsApp is zero lines:
          </p>
          <TerminalOutput
            title="whatsapp-mcp-macos / Sources/WhatsAppMCP/main.swift"
            lines={grepLines}
          />
          <p className="text-zinc-700 leading-relaxed mb-4">
            Six imports, and not one of them is a networking framework.{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
              ApplicationServices
            </code>{" "}
            is the macOS accessibility framework, the same one VoiceOver uses to
            read the screen.{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
              CoreGraphics
            </code>{" "}
            posts mouse clicks and key events. The server reads the WhatsApp
            window through the accessibility tree, computes screen coordinates,
            clicks, and pastes text from the clipboard. There is no socket to
            WhatsApp, no protocol handshake, no QR pairing for the automation
            layer. The only program on the wire to Meta is Meta&rsquo;s own
            binary, carrying its own genuine fingerprint.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Concretely: an unofficial API consumes one of your four WhatsApp
            companion-device slots and shows up in the linked-devices list as a
            new entry. This path consumes zero. The desktop app is the device
            you already approved by QR; the MCP server is not a device at all.
            Open WhatsApp settings after installing it and the linked-devices
            count has not moved.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Setup is an npm install and an MCP config block. Note the{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
              env
            </code>{" "}
            object. It is empty because there is genuinely nothing to put in it:
          </p>
          <AnimatedCodeBlock
            code={mcpConfig}
            language="json"
            filename="~/.claude.json"
          />
          <p className="text-zinc-700 leading-relaxed">
            No API key, no token, no phone number ID, no Meta developer account.
            The architecture-level breakdown of why the operating-system path
            beats every API substitute is on the{" "}
            <a
              href="/t/whatsapp-mac-mcp-without-business-api"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              WhatsApp Mac MCP without the Business API
            </a>{" "}
            page, and the mechanics of accessibility-driven automation are
            covered in{" "}
            <a
              href="/t/whatsapp-desktop-accessibility-automation"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              WhatsApp desktop accessibility automation
            </a>
            .
          </p>
        </section>

        {/* Honest limits */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
            What Door 3 cannot do
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            This path is not free of tradeoffs. It is the right answer for a
            specific shape of problem, and the wrong one outside it. The honest
            limits:
          </p>
          <ul className="space-y-3 mb-4">
            {[
              "macOS only. It depends on Apple's accessibility framework and the WhatsApp Catalyst app. There is no Windows or Linux version, and WhatsApp does not even ship a Linux desktop app.",
              "The desktop app has to be running and signed in. The automation drives a visible window; it is not a headless background service.",
              "Human scale, not broadcast scale. It sends one message at a time into chats you open. It is not built for opt-in marketing blasts to thousands of numbers.",
              "No verified sender badge, no message templates, no delivery webhooks. Those are Business Platform features, and if you need them you genuinely need Door 1.",
              "It works on one account: the one signed into your desktop app.",
            ].map((line) => (
              <li key={line} className="flex gap-3 text-zinc-700 leading-relaxed">
                <span
                  aria-hidden
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="text-zinc-700 leading-relaxed">
            If any of those is a dealbreaker, take Door 1 and accept the Meta
            Business account. That is the trade: the official Platform asks for
            the bureaucracy and gives you scale and a stable contract in return.
          </p>
        </section>

        {/* Recommendation */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">
            Which door, honestly
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            If you are a business running opt-in broadcasts, customer-service
            queues or notification flows at volume, you want Door 1. The Meta
            Business account is a cost, not a blocker, and the Platform is the
            only path with a contract behind it. The{" "}
            <a
              href="/alternative/whatsapp-business-api-alternative"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              honest taxonomy of Business API alternatives
            </a>{" "}
            covers where the in-between resellers fit.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            If you are a developer, a solo founder routing inbound, or someone
            wiring an AI agent into WhatsApp on your personal account, Door 2 is
            a trap. You will skip Meta, ship in an afternoon, and lose the number
            in a sweep a month later. The custody side of that risk, where your
            session becomes a portable credential file, is covered in{" "}
            <a
              href="/t/self-hosted-whatsapp-gateway-risk"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              the hidden risk of a self-hosted WhatsApp gateway
            </a>
            .
          </p>
          <p className="text-zinc-700 leading-relaxed">
            For that personal, agent-scale use case, Door 3 is the path that
            skips the Meta Business account without ever putting your number in
            front of ban detection, because it never connects to WhatsApp as a
            client. That is the whole point.
          </p>
        </section>

        <div className="mt-20 px-6">
          <div className="max-w-3xl mx-auto">
            <BookCallCTA
              appearance="footer"
              destination={CAL_LINK}
              site="WhatsApp MCP"
              section="guide-footer"
              heading="Not sure which door your use case actually needs?"
              description="Book 30 minutes. We will sort whether you need the official Business Platform, or whether driving the desktop app on macOS is the cleaner fit, before you write a line of integration code."
            />
          </div>
        </div>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <FaqSection items={faqItems} />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          section="guide-sticky"
          description="Pick the right WhatsApp path before you build, in 30 min."
        />
      </article>
    </>
  );
}
