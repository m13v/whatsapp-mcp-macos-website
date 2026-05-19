import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  GradientText,
  BackgroundGrid,
  ShineBorder,
  ShimmerButton,
  ComparisonTable,
  StepTimeline,
  AnimatedCodeBlock,
  AnimatedChecklist,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/whatsapp-automation-without-web-protocol";
const PUBLISHED = "2026-05-18";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";
const GITHUB = "https://github.com/m13v/whatsapp-mcp-macos";
const BAILEYS = "https://github.com/WhiskeySockets/Baileys";

export const metadata: Metadata = {
  title:
    "WhatsApp automation without the web protocol: drive the desktop app instead",
  description:
    "You can automate WhatsApp without speaking its web protocol. Instead of opening a WebSocket session like Baileys or running WhatsApp Web in a headless browser, whatsapp-mcp-macos reads the macOS accessibility tree of the genuine desktop app and posts synthetic clicks. No new linked device, no reverse-engineered client.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "WhatsApp automation without the web protocol",
    description:
      "Automate the genuine WhatsApp desktop app at the OS UI layer. No WebSocket session, no headless browser, no extra linked device.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp automation without the web protocol",
    description:
      "Drive the real desktop app via macOS accessibility APIs instead of reverse-engineering WhatsApp Web's WebSocket protocol.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "WhatsApp automation without the web protocol" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "WhatsApp automation without the web protocol", url: PAGE_URL },
];

const comparisonRows = [
  {
    feature: "What it connects to",
    competitor:
      "Opens its own WebSocket session to WhatsApp's servers (Baileys), or runs WhatsApp Web inside a headless browser (whatsapp-web.js).",
    ours: "Connects to nothing. It reads the accessibility tree of the WhatsApp app already running on your Mac.",
  },
  {
    feature: "Devices on your account",
    competitor:
      "Pairs a new linked device by QR. It appears in Linked Devices and spends one of your four slots.",
    ours: "Adds no device. It drives the desktop app that is already linked.",
  },
  {
    feature: "Who WhatsApp sees",
    competitor:
      "A client rebuilt from observed protocol behavior. Its handshake is the thing ban sweeps look for.",
    ours: "The genuine, Meta-signed desktop app. Nothing else talks to WhatsApp on your behalf.",
  },
  {
    feature: "Breaks when",
    competitor:
      "WhatsApp changes its encryption handshake, multi-device protocol, or web bundle.",
    ours: "The WhatsApp window layout shifts, or Accessibility permission is revoked.",
  },
  {
    feature: "Runs headless on a server",
    competitor: "Yes. That is the whole point of the approach.",
    ours: "No. It needs a real macOS session with the desktop app open.",
  },
  {
    feature: "Setup",
    competitor: "npm install, scan a QR, then babysit an auth-state file.",
    ours: "npm install -g whatsapp-mcp-macos, grant Accessibility permission once.",
  },
];

const timelineSteps = [
  {
    title: "Find the process, not a connection",
    description:
      "It locates the running app by bundle id net.whatsapp.WhatsApp. If WhatsApp is not open, it launches it with /usr/bin/open. No socket, no QR pairing, no auth handshake.",
  },
  {
    title: "Read the screen as a tree",
    description:
      "traverseAXTree walks the app's AXUIElement tree to depth 15, collecting buttons, text fields, and headings with their on-screen coordinates. This is the same accessibility API a screen reader uses.",
  },
  {
    title: "Click and type like a person",
    description:
      "To open a chat or send a message it posts CGEvent mouse clicks at computed coordinates and pastes text via the clipboard plus Cmd+V. Your cursor position is saved and restored so the pointer does not jump.",
  },
  {
    title: "Confirm by reading, not by ACK",
    description:
      "After pressing Return, handleSendMessage re-traverses the tree and looks for a node whose description starts with \"Your message,\". The send is verified the way you would verify it: by looking at the chat.",
  },
];

const verifyCode = `// inside handleSendMessage, right after pressReturn()
let postElements = traverseAXTree(pid: pid)
let generic = findElements(in: postElements, role: "AXGenericElement")

var lastSent: String? = nil
for el in generic {
    let desc = cleanUnicode(el.description ?? "")
    if desc.hasPrefix("Your message, ") {
        // outgoing bubble: "Your message, <text>, 3:41 PM, Sent to ..."
        lastSent = desc
    }
}

// verified == our own text is rendered back in the chat.
// there is no delivery receipt to check, because no socket was opened.
let verified = lastSent?.contains(message) ?? false`;

const buysYou = [
  {
    text: "No linked-device slot spent. The desktop app you already use stays the only client.",
    checked: true,
  },
  {
    text: "Nothing for WhatsApp to fingerprint. The only traffic on your account is the genuine app.",
    checked: true,
  },
  {
    text: "No QR re-scans, no auth-state file to keep alive between restarts.",
    checked: true,
  },
  {
    text: "Sees exactly what you see, including end-to-end encrypted chats, because it reads the rendered UI.",
    checked: true,
  },
  {
    text: "Ships as an MCP server, so Claude, Cursor, or your own agent can call it directly.",
    checked: true,
  },
];

const faqItems = [
  {
    q: "Does this connect to WhatsApp's servers at all?",
    a: "No. The WhatsApp desktop app connects to WhatsApp. whatsapp-mcp-macos only reads that app's on-screen accessibility tree and posts mouse and keyboard events to it. From WhatsApp's side there is exactly one client on your account, the official desktop app, and it is the real one.",
  },
  {
    q: "Is this the same as whatsapp-web.js or Baileys?",
    a: "No. Those speak WhatsApp Web's WebSocket protocol. Baileys connects to it directly; whatsapp-web.js drives a headless browser that runs WhatsApp Web. Both pair a separate, reverse-engineered linked device. The accessibility approach drives the desktop app you already have and pairs nothing new.",
  },
  {
    q: "Will automating WhatsApp this way get my number banned?",
    a: "There is no reverse-engineered client for WhatsApp to detect, because the only thing talking to WhatsApp is the genuine app. The usual ban trigger for unofficial automation, a forged client handshake, is simply not present. It is still automation of a personal account, so keep volume human and stay within WhatsApp's terms of service.",
  },
  {
    q: "Can it run headless or on a server?",
    a: "No. It needs a real macOS session (macOS 13 or later) with the WhatsApp desktop app open and Accessibility permission granted. If you need a headless server bot with no Mac in the loop, a web-protocol library or the official Business API is the right tool. This page is honest about that trade.",
  },
  {
    q: "Automating the UI sounds fragile. Why not just speak the protocol?",
    a: "Both are fragile, just to different changes. A protocol client breaks when WhatsApp changes its encryption handshake or web bundle. A UI driver breaks when the window layout shifts. The UI layer trades server-side fragility for one guarantee: you are never a client WhatsApp can flag, because you never become a client at all.",
  },
  {
    q: "Does it need the WhatsApp Business API or a Meta developer account?",
    a: "No. No API keys, no webhooks, no Meta developer account, no message templates. Install the npm package, grant Accessibility permission, and point your MCP client at it.",
  },
  {
    q: "What can it actually do?",
    a: "Search contacts and chats, open a chat by index, read messages with sender and timestamp, send text messages with post-send verification, list chats with unread counts, and switch tabs. Eleven MCP tools in total. It sends text only, not media, and reads only the messages currently rendered on screen.",
  },
];

const relatedPosts = [
  {
    title: "WhatsApp Desktop accessibility automation: the TCC trap",
    href: "/t/whatsapp-desktop-accessibility-automation",
    excerpt:
      "AXIsProcessTrusted can return true while accessibility reads silently fail. Here is the functional probe that catches it.",
    tag: "Deep dive",
  },
  {
    title: "A WhatsApp API without a Meta Business account",
    href: "/t/whatsapp-without-business-api-ban",
    excerpt:
      "Three real options for programmatic WhatsApp, and why one of them ends in a banned number.",
    tag: "Guide",
  },
  {
    title: "WhatsApp Mac MCP without the Business API",
    href: "/t/whatsapp-mac-mcp-without-business-api",
    excerpt:
      "What an MCP server for WhatsApp on macOS looks like when it skips Meta's Business API entirely.",
    tag: "Guide",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "WhatsApp automation without the web protocol: drive the desktop app instead",
    description:
      "You can automate WhatsApp without speaking its web protocol. Instead of opening a WebSocket session or running WhatsApp Web in a headless browser, whatsapp-mcp-macos reads the macOS accessibility tree of the genuine desktop app and posts synthetic clicks.",
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

export default function WhatsappAutomationWithoutWebProtocolPage() {
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
              WhatsApp automation{" "}
              <GradientText>without the web protocol</GradientText>
            </h1>
            <p className="text-base md:text-lg text-zinc-700 leading-relaxed mb-4">
              Almost every WhatsApp automation tutorial assumes one of two
              things: you reverse-engineer WhatsApp Web&apos;s WebSocket
              protocol, or you run WhatsApp Web inside a headless browser.
              There is a third way that touches neither. You drive the genuine
              desktop app at the operating-system UI layer.
            </p>
            <p className="text-sm md:text-base text-zinc-500 leading-relaxed mb-8">
              Written for someone who landed here from a thread, is on a Mac,
              and wants the honest version before installing anything.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="/install">
                See the no-protocol path
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
                Direct answer &mdash; verified 2026-05-18
              </p>
              <p className="text-lg md:text-xl text-zinc-900 font-semibold leading-snug mb-3">
                Yes. You can automate WhatsApp without its web protocol by
                automating the genuine desktop app instead of becoming a client.
              </p>
              <p className="text-sm md:text-base text-zinc-700 leading-relaxed">
                <a href={GITHUB} className="text-teal-700 underline">
                  whatsapp-mcp-macos
                </a>{" "}
                reads the macOS accessibility tree of the WhatsApp app on your
                Mac and posts synthetic mouse and keyboard events. It never
                opens a network connection to WhatsApp, never pairs a new
                device, and never reverse-engineers the protocol. The trade:
                macOS only, and the desktop app has to be running.
              </p>
            </div>
          </ShineBorder>
        </section>

        <div className="mt-10">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="6 min read"
          />
        </div>

        {/* What the web protocol means */}
        <section className="max-w-3xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-5">
            What people mean by &quot;the web protocol&quot;
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            WhatsApp Web and WhatsApp Desktop talk to WhatsApp&apos;s servers
            over a WebSocket-based, multi-device protocol. It is not a public
            API. Everything known about it comes from people watching the wire
            and writing down what they saw. That body of work is what
            unofficial automation libraries are built on.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            <a href={BAILEYS} className="text-teal-700 underline">
              Baileys
            </a>{" "}
            connects to that WebSocket protocol directly from Node, with no
            browser at all. whatsapp-web.js takes the other route: it drives a
            real WhatsApp Web session inside a headless browser. The mechanics
            differ, but the outcome is the same. Both register a fresh,
            reverse-engineered linked device on your account, and both
            authenticate by scanning a QR code. When this page says &quot;the
            web protocol,&quot; that is the thing it means.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed">
            That linked device is the catch. WhatsApp gives you one primary
            phone plus up to four linked devices. A web-protocol library spends
            one of those slots on a client that WhatsApp did not ship, and that
            client&apos;s handshake is exactly what ban sweeps look for.
          </p>
        </section>

        {/* Three layers */}
        <section className="max-w-3xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            Three places automation can plug in
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-7">
            A WhatsApp message travels through several layers between your
            intent and Meta&apos;s servers. You can hook automation into any of
            them. Only one of the three avoids the web protocol and avoids Meta.
          </p>
          <div className="grid gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-zinc-400">01</span>
                <h3 className="text-lg font-semibold text-zinc-900">
                  The wire protocol
                </h3>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed">
                WhatsApp Web&apos;s multi-device WebSocket. Baileys connects to
                it directly; whatsapp-web.js drives a browser that does. Either
                way you become a reverse-engineered linked device. This is the
                web protocol, and it is the layer this page is about avoiding.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-zinc-400">02</span>
                <h3 className="text-lg font-semibold text-zinc-900">
                  The Cloud API
                </h3>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed">
                Meta&apos;s official WhatsApp Business HTTP API. Supported and
                stable, but it needs a Meta Business account, a verified
                number, and approved message templates. It is a different
                product for a different job, not a drop-in for a personal
                account.
              </p>
            </div>
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-teal-500">03</span>
                <h3 className="text-lg font-semibold text-zinc-900">
                  The app&apos;s own UI
                </h3>
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed">
                The genuine desktop app is already a fully authenticated
                client. Automate it at the screen layer with macOS accessibility
                APIs: read the UI, click buttons, type into fields. No protocol,
                no new device, no Meta account. This is what whatsapp-mcp-macos
                does.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            Web-protocol automation vs driving the desktop app
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-7">
            Same goal, two architectures. The honest difference is not features,
            it is what each one becomes on your account.
          </p>
          <ComparisonTable
            productName="Desktop accessibility (WhatsApp MCP)"
            competitorName="Web-protocol automation"
            rows={comparisonRows}
            caveat="Web-protocol automation wins on headless and cross-platform. If you need a server-side bot with no Mac in the loop, it is the only option here. The desktop approach trades that reach for never being a client WhatsApp can flag."
          />
        </section>

        {/* How it works */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            How the no-protocol path actually works
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-7">
            The whole server is one Swift file, about 1,200 lines. Sending a
            message is four moves, and not one of them is a network call.
          </p>
          <StepTimeline steps={timelineSteps} />
        </section>

        {/* Anchor fact code */}
        <section className="max-w-3xl mx-auto px-6 mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-3">
            The proof is in how it confirms a send
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-6">
            A protocol client knows a message was sent because the server sends
            back a delivery receipt. whatsapp-mcp-macos has no server connection
            to receive one. So after it presses Return, its{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              handleSendMessage
            </code>{" "}
            function re-reads the screen and checks that your text is rendered
            back in the chat. If you want to verify this claim yourself, open{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              Sources/WhatsAppMCP/main.swift
            </code>{" "}
            and search for the string{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              &quot;Your message, &quot;
            </code>
            .
          </p>
          <AnimatedCodeBlock
            code={verifyCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
          <p className="text-sm text-zinc-500 leading-relaxed mt-4">
            Confirmation here is a UI read, not a protocol event. That is the
            tell: there is no socket anywhere in the send path, so there is
            nothing for WhatsApp to attribute to a client other than its own
            app.
          </p>
        </section>

        {/* What it buys you */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
            What skipping the web protocol buys you
          </h2>
          <AnimatedChecklist
            title="On your account, the difference is concrete"
            items={buysYou}
          />
        </section>

        {/* Honest limits */}
        <section className="max-w-3xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-5">
            The honest limitations
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-5">
            This approach is not strictly better. It is a different trade, and
            the cases where it loses are real.
          </p>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
            <ul className="space-y-3 text-sm md:text-base text-zinc-700">
              <li>
                <span className="font-semibold text-zinc-900">
                  macOS only.
                </span>{" "}
                It controls the native macOS WhatsApp app. There is no Windows,
                Linux, or container build.
              </li>
              <li>
                <span className="font-semibold text-zinc-900">
                  The desktop app must be running.
                </span>{" "}
                No app open, no UI to read. It cannot run truly headless.
              </li>
              <li>
                <span className="font-semibold text-zinc-900">
                  Visible messages only.
                </span>{" "}
                It reads what WhatsApp has rendered into the accessibility tree.
                History that has not scrolled into view is not reachable.
              </li>
              <li>
                <span className="font-semibold text-zinc-900">
                  Text messages only.
                </span>{" "}
                The send tool handles text. Images, files, and voice notes are
                not supported.
              </li>
              <li>
                <span className="font-semibold text-zinc-900">
                  Not built for broadcast volume.
                </span>{" "}
                If you need opted-in template blasts to thousands of numbers,
                that is the WhatsApp Business Cloud API&apos;s job, not this.
              </li>
            </ul>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <BookCallCTA
            appearance="footer"
            destination={CAL_LINK}
            site="WhatsApp MCP"
            heading="Not sure the desktop-app approach fits your use case?"
            description="Talk it through with the person who built it before you wire anything up."
          />
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
            Questions people ask before installing
          </h2>
          <FaqSection items={faqItems} />
        </section>

        {/* Related */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <RelatedPostsGrid
            title="Keep reading"
            posts={relatedPosts}
          />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination={CAL_LINK}
        site="WhatsApp MCP"
        description="Questions about automating WhatsApp without the web protocol? Book a quick call."
      />
    </>
  );
}
