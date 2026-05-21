import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  GradientText,
  BackgroundGrid,
  ShineBorder,
  TerminalOutput,
  ComparisonTable,
  BentoGrid,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/whatsapp-message-logs-meta-servers";
const PUBLISHED = "2026-05-21";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";
const GITHUB = "https://github.com/m13v/whatsapp-mcp-macos";
const WA_PRIVACY = "https://www.whatsapp.com/legal/privacy-policy";
const WA_E2E_FAQ = "https://faq.whatsapp.com/820124435853543/";
const SIGNAL_PROTOCOL =
  "https://signal.org/docs/specifications/doubleratchet/";

export const metadata: Metadata = {
  title:
    "Does Meta keep WhatsApp message logs on its servers? The honest answer",
  description:
    "Per WhatsApp's own privacy policy, delivered messages are deleted from Meta's servers and undelivered ones are kept encrypted for up to 30 days. Content stays end-to-end encrypted under Signal Protocol, but metadata is stored. The harder question is what your automation tool adds on top.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Does Meta keep WhatsApp message logs on its servers?",
    description:
      "What WhatsApp's privacy policy actually says about server-side logs, what stays encrypted, what doesn't, and the part the FAQ pages skip: whether your automation tool adds a new logging surface on top.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "WhatsApp message logs on Meta servers, explained without the marketing",
    description:
      "Delivered messages: deleted. Undelivered: encrypted for up to 30 days. Metadata: kept. Third-party bots are the part nobody warns you about.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "WhatsApp message logs on Meta servers" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "WhatsApp message logs on Meta servers", url: PAGE_URL },
];

const grepTerminal = [
  {
    text: "$ cd ~/whatsapp-mcp-skill-macos",
    type: "command" as const,
  },
  {
    text: "$ wc -l Sources/WhatsAppMCP/main.swift",
    type: "command" as const,
  },
  { text: "    1214 Sources/WhatsAppMCP/main.swift", type: "output" as const },
  {
    text: '$ grep -n "URLSession\\|http\\|https\\|telemetry\\|analytics\\|fetch\\|upload" \\\n    Sources/WhatsAppMCP/main.swift',
    type: "command" as const,
  },
  { text: "(no matches)", type: "output" as const },
  {
    text: "// 1214 lines, zero network calls. The server cannot ship",
    type: "info" as const,
  },
  {
    text: "// your messages anywhere because it has no socket to ship them on.",
    type: "info" as const,
  },
];

const whatGetsStored = [
  {
    title: "Delivered message bodies",
    description:
      "Deleted from Meta's servers once the recipient device acknowledges receipt. Per the privacy policy, this is the default for the overwhelming majority of traffic.",
    size: "2x1" as const,
    accent: true,
  },
  {
    title: "Undelivered messages",
    description:
      "Held encrypted on Meta's servers for up to 30 days while delivery is retried, then deleted. Meta cannot read the contents while the blob sits there because the keys live on your device.",
  },
  {
    title: "Forwarded media (briefly)",
    description:
      "When you forward media, WhatsApp keeps a temporary encrypted copy on its servers to make subsequent forwards faster. Same encryption posture: Meta does not hold the key.",
  },
  {
    title: "Metadata (this is the part to actually worry about)",
    description:
      "Phone number, device info, IP address, who you messaged and when, group membership, last-seen, and connection logs. None of this is content, all of it is stored, and it is enough to reconstruct a social graph in detail.",
    size: "2x1" as const,
  },
];

const automationCompareRows = [
  {
    feature: "Where your plaintext message exists at send time",
    ours: "Only inside the official WhatsApp app on your Mac, briefly, before Signal Protocol encrypts it",
    competitor:
      "Inside the third-party server you sent it to, which encrypts and posts to Meta on your behalf",
  },
  {
    feature: "Number of parties that can log the plaintext",
    ours:
      "One: the WhatsApp client itself (your device, your control)",
    competitor:
      "Two or more: WhatsApp client plus the bot provider, plus any vendor they sit behind",
  },
  {
    feature: "Network calls the automation layer itself makes",
    ours:
      "Zero. The 1214-line main.swift has no URLSession, no http client, no telemetry pipe",
    competitor:
      "Many. Cloud API wrappers, hosted SaaS, and Web-protocol bots all post your messages to their own backend first",
  },
  {
    feature: "Compliance posture",
    ours:
      "Same posture as using WhatsApp Desktop yourself. No new processor added.",
    competitor:
      "Adds a new data processor under most privacy frameworks (GDPR, CCPA), with its own retention policy you have to read",
  },
  {
    feature: "Server-side logs you have to trust",
    ours:
      "Meta's, same as the official app. Nothing else added.",
    competitor:
      "Meta's, plus the vendor's, plus any infra the vendor sits on (AWS, GCP, downstream analytics).",
  },
];

const verifySteps = [
  {
    label:
      "Read WhatsApp's privacy policy section on message storage",
    detail:
      "It is short and unambiguous. Search the page for the literal phrase 'Once your messages are delivered, they are deleted from our servers.' That is the canonical sentence on retention.",
  },
  {
    label: "Confirm the encryption claim against the Signal Protocol spec",
    detail:
      "WhatsApp uses the Signal double-ratchet. Keys derive client-side, Meta never sees them. Even the 30-day undelivered blob is unreadable to Meta unless the key material is somehow exfiltrated from a device.",
  },
  {
    label: "Run the grep on the WhatsApp MCP source yourself",
    detail:
      "Clone the repo, open Sources/WhatsAppMCP/main.swift, grep for URLSession, http, telemetry, analytics, fetch, upload. Every search returns zero hits. There is nowhere in the code for your messages to be logged.",
  },
  {
    label: "Compare to any cloud-hosted automation",
    detail:
      "Open the architecture docs of any hosted WhatsApp bot platform. Every send call goes to their backend first, gets logged, then forwarded. That is two logging surfaces minimum.",
  },
];

const faqItems = [
  {
    question: "Does Meta keep logs of my WhatsApp messages on its servers?",
    answer:
      "Per WhatsApp's privacy policy, delivered messages are deleted from Meta's servers. Undelivered messages are stored encrypted for up to 30 days then deleted. Content stays end-to-end encrypted via the Signal Protocol the whole time, so Meta cannot read message bodies even while the encrypted blob sits in its queue.",
  },
  {
    question: "Does that mean Meta knows nothing about my messages?",
    answer:
      "No. Meta does not see content, but it stores metadata: who you messaged and when, your IP address, device info, group memberships, last-seen, and connection logs. That is enough to build a detailed social graph. The privacy promise is content-only.",
  },
  {
    question: "What happens during the 30-day undelivered window?",
    answer:
      "The message sits on Meta's servers as a Signal Protocol ciphertext addressed to the recipient's device key. Meta retries delivery. If the recipient never comes online in 30 days, the encrypted blob is deleted. Nobody at Meta has the key to decrypt it during that window.",
  },
  {
    question: "If I use a WhatsApp automation tool, does that change the picture?",
    answer:
      "It depends entirely on the tool. A local accessibility shim like WhatsApp MCP runs on your Mac, drives the official desktop app, and adds zero new servers. A hosted bot platform or Cloud API wrapper sends your plaintext to their backend before forwarding to Meta, so you have added a second logging surface that does retain content.",
  },
  {
    question: "How do I verify WhatsApp MCP itself does not log my messages?",
    answer:
      "Clone the repo at github.com/m13v/whatsapp-mcp-macos, open Sources/WhatsAppMCP/main.swift, and grep for URLSession, http, telemetry, analytics, fetch, or upload. All return zero matches across 1214 lines. The MCP server is a stdio process that talks to the macOS accessibility APIs and your local AI assistant. It has no socket to send messages anywhere.",
  },
  {
    question: "Are encrypted backups in iCloud or Google Drive also unreadable to Meta?",
    answer:
      "Only if you enable end-to-end encrypted backups, which is a separate toggle in WhatsApp settings. With the toggle on, your backup is encrypted with a key derived from a 64-digit code or password that lives only on your device. Without it, the cloud provider holds the keys, not Meta, but the backup is not end-to-end encrypted.",
  },
  {
    question: "Can law enforcement get my message content from Meta?",
    answer:
      "Meta can hand over what it has, which is metadata plus any undelivered ciphertext in the 30-day window. It cannot decrypt that ciphertext. The places content has historically been recovered are the endpoints: an unlocked phone, an unencrypted iCloud backup, a screenshot.",
  },
];

const relatedPosts = [
  {
    href: "/t/openwa-whatsapp-web-protocol-fragility",
    title:
      "openwa and WhatsApp Web protocol fragility: where it actually breaks",
    excerpt:
      "Why automation tools that drive WhatsApp Web are structurally unstable, and what that means for any production workflow.",
    tag: "Architecture",
  },
  {
    href: "/t/drive-whatsapp-via-accessibility-apis",
    title: "Driving WhatsApp on macOS via accessibility APIs",
    excerpt:
      "How the desktop-accessibility path actually works, why it does not add a new logging surface, and where the limits are.",
    tag: "Deep dive",
  },
  {
    href: "/t/whatsapp-cloud-api-wrapper-limits",
    title: "WhatsApp Cloud API wrappers: where they hit a ceiling",
    excerpt:
      "Cloud API wrappers add a server you have to trust with plaintext. Here is what that buys you and what it costs.",
    tag: "Comparison",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "Does Meta keep WhatsApp message logs on its servers? The honest answer",
    description:
      "Per WhatsApp's own privacy policy, delivered messages are deleted from Meta's servers and undelivered ones are kept encrypted for up to 30 days. Content stays end-to-end encrypted under Signal Protocol, but metadata is stored. The harder question is what your automation tool adds on top.",
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

export default function WhatsappMessageLogsMetaServersPage() {
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

            <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 leading-[1.05] mt-6 mb-5 tracking-tight">
              Does Meta keep{" "}
              <GradientText>WhatsApp message logs</GradientText> on its
              servers?
            </h1>

            <p className="text-lg text-zinc-700 leading-relaxed mb-8 max-w-2xl">
              Short version: delivered messages are deleted; undelivered ones
              are held encrypted for up to 30 days; the part Meta actually
              keeps is metadata. The part the privacy pages skip is what your
              automation tool adds on top of that.
            </p>

            <ShineBorder color="#14b8a6" borderWidth={1.5}>
              <div className="rounded-xl bg-white p-6">
                <div className="text-xs font-semibold tracking-wider text-teal-700 uppercase mb-3">
                  Direct answer (verified 2026-05-21)
                </div>
                <p className="text-base text-zinc-800 leading-relaxed mb-3">
                  Per{" "}
                  <a
                    href={WA_PRIVACY}
                    className="text-teal-700 underline"
                    rel="noopener"
                  >
                    WhatsApp&apos;s privacy policy
                  </a>
                  : &quot;Once your messages are delivered, they are deleted
                  from our servers.&quot; Undelivered messages are stored in
                  encrypted form for up to 30 days, then deleted. Content is
                  end-to-end encrypted via the{" "}
                  <a
                    href={SIGNAL_PROTOCOL}
                    className="text-teal-700 underline"
                    rel="noopener"
                  >
                    Signal Protocol
                  </a>{" "}
                  the entire time, so Meta cannot read message bodies even
                  while ciphertext sits in its retry queue.
                </p>
                <p className="text-base text-zinc-800 leading-relaxed">
                  What Meta does retain is{" "}
                  <span className="font-semibold">metadata</span>: phone
                  numbers, device info, IP addresses, message timestamps,
                  group membership, last-seen, and connection logs. The
                  encryption promise is content-only.
                </p>
              </div>
            </ShineBorder>
          </div>
        </BackgroundGrid>

        <div className="max-w-3xl mx-auto px-6 mt-10">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="6 min read"
          />
        </div>

        {/* What gets stored */}
        <section className="max-w-3xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-5">
            What WhatsApp actually stores on Meta&apos;s servers
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-7">
            Four categories, separated because the privacy posture for each
            is different. Most posts on this lump them together and end up
            either too alarmist or too reassuring. The honest breakdown:
          </p>
          <AnimatedChecklist title="" items={whatGetsStored} />
        </section>

        {/* The 30-day window */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-5">
            The 30-day undelivered window, explained without panic
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            When you send a message to a phone that is offline, Meta has to
            hold the message until that phone comes back online. That holding
            period is the only time message content sits on Meta&apos;s
            servers for any meaningful length. The retention window is 30
            days and the policy is unambiguous: if delivery has not happened
            by then, the encrypted blob is deleted.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            During that window, the message is a Signal Protocol ciphertext
            addressed to a specific device key. Meta does not derive or hold
            any decryption key for it. The keys live on the sender&apos;s and
            recipient&apos;s devices, generated client-side, rotated per
            session via the double ratchet. The whitepaper-level summary is
            on the{" "}
            <a
              href={WA_E2E_FAQ}
              className="text-teal-700 underline"
              rel="noopener"
            >
              WhatsApp end-to-end encryption FAQ
            </a>
            .
          </p>
          <p className="text-base text-zinc-700 leading-relaxed">
            People sometimes read &quot;stored on Meta&apos;s servers for 30
            days&quot; and assume that means Meta can read it. It does not.
            It means Meta is holding a blob of bytes it cannot decrypt and
            will throw away if the recipient does not come online in time.
          </p>
        </section>

        {/* The metadata reality */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-5">
            The part you should actually think about: metadata
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            End-to-end encryption protects the content of your messages. It
            does not protect the envelope. Meta knows your phone number, the
            phone numbers you message, the times you message them, the
            frequency, your IP, your device model, your group memberships,
            and your read receipts. That is a social graph at industrial
            scale.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            For most personal use this is a Meta-level concern that lives
            outside what an automation tool can change. The relevant thing
            for anyone wiring up an MCP server or a bot is that the
            metadata picture does not get worse when you read or send
            messages programmatically through the local desktop app, because
            from Meta&apos;s side it is still your one device, your one IP,
            your one session.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed">
            That is the second-order claim this page is really making. The
            first-order claim (Meta deletes delivered content) is in the
            policy. The second-order claim (your automation choice
            determines whether anyone <em>else</em> logs your content) is
            the one the FAQ pages do not cover.
          </p>
        </section>

        {/* The automation logging surface */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-5">
            Automation tools add a logging surface Meta&apos;s policy
            doesn&apos;t cover
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            The privacy policy describes what Meta does. It does not, and
            cannot, describe what any third party you wire into your
            WhatsApp does. That third party gets the plaintext before the
            Signal Protocol ever encrypts it, because the encryption only
            happens inside the WhatsApp client itself.
          </p>
          <p className="text-base text-zinc-700 leading-relaxed mb-7">
            So the question to ask of any WhatsApp automation tool is
            simple: where does the plaintext live, and for how long, before
            it reaches the WhatsApp client? The answers split cleanly.
          </p>
          <ComparisonTable
            productName="Local accessibility (WhatsApp MCP)"
            competitorName="Cloud-hosted bot / API wrapper"
            rows={automationCompareRows}
            caveat="If you need cross-platform or headless server-side messaging, a hosted Cloud API wrapper is the right tool and adding their logging surface is the price. For solo, desktop-bound, AI-assistant use cases, the local-only path is honestly hard to beat."
          />
        </section>

        {/* The grep proof */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-5">
            Proof the MCP server can&apos;t log your messages
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-4">
            The WhatsApp MCP server is one Swift file:{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              Sources/WhatsAppMCP/main.swift
            </code>
            . 1214 lines. If you want to know whether it can quietly ship
            your messages anywhere, you grep for the words that would have
            to appear if it could.
          </p>
          <TerminalOutput title="Run this against the source yourself" lines={grepTerminal} />
          <p className="text-sm text-zinc-500 leading-relaxed mt-4">
            The repo is open. The binary is built from the same source. The
            MCP server speaks stdio to your local AI assistant and AX APIs
            to the WhatsApp app. There is no third channel. If a future
            release adds one, the grep above is the test that catches it.
          </p>
        </section>

        {/* Verification */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-5">
            Verify all of this in under five minutes
          </h2>
          <p className="text-base text-zinc-700 leading-relaxed mb-6">
            None of the claims above need to be taken on trust. The policy
            is public, the protocol is published, and the source is on
            GitHub.
          </p>
          <ol className="space-y-4">
            {verifySteps.map((step, i) => (
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
            heading="Working out the privacy posture of a WhatsApp workflow?"
            description="Fifteen minutes with the person who wrote the local-only path. Honest about what it does and where the limits are."
          />
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
            Questions readers ask about this
          </h2>
          <FaqSection items={faqItems} heading="" />
        </section>

        {/* Related */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
        </section>

        {/* Source note */}
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
            <p className="text-sm text-zinc-700 leading-relaxed">
              <span className="font-semibold text-zinc-900">
                Where these numbers come from.
              </span>{" "}
              Retention timing and the &quot;deleted on delivery&quot;
              language come straight from{" "}
              <a
                href={WA_PRIVACY}
                className="text-teal-700 underline"
                rel="noopener"
              >
                WhatsApp&apos;s public privacy policy
              </a>
              . The encryption posture is the Signal Protocol, documented at
              signal.org. The line count and grep result for the MCP server
              come from the open source repo at{" "}
              <a
                href={GITHUB}
                className="text-teal-700 underline"
                rel="noopener"
              >
                github.com/m13v/whatsapp-mcp-macos
              </a>
              , verified on the date stamped above. If any of these change,
              the grep is the canary that catches it.
            </p>
          </div>
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination={CAL_LINK}
        site="WhatsApp MCP"
        description="Need to think through where your WhatsApp plaintext actually lives? Book a quick call."
      />
    </>
  );
}
