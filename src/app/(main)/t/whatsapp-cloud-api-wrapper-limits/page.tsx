import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  GlowCard,
  GradientText,
  ComparisonTable,
  MetricsRow,
  StepTimeline,
  AnimatedChecklist,
  ProofBanner,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@seo/components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/whatsapp-cloud-api-wrapper-limits";
const PUBLISHED = "2026-05-20";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";
const GITHUB = "https://github.com/m13v/whatsapp-mcp-macos";

const META_LIMITS =
  "https://developers.facebook.com/documentation/business-messaging/whatsapp/messaging-limits";
const META_MARKETING_PER_USER =
  "https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/marketing-templates/per-user-limits/";
const TWILIO_SANDBOX = "https://www.twilio.com/docs/whatsapp/sandbox";
const TWILIO_WINDOW = "https://www.twilio.com/docs/api/errors/63016";
const DIALOG_PRICING = "https://360dialog.com/pricing";
const VONAGE_PRICING =
  "https://api.support.vonage.com/hc/en-us/articles/19800233069084-WhatsApp-Pricing";

export const metadata: Metadata = {
  title:
    "WhatsApp Cloud API wrapper limits: the three-layer ceiling no one stacks for you",
  description:
    "Meta's 80 MPS default, 250-to-unlimited conversation tiers, and per-user marketing caps are layer one. Every BSP wrapper (Twilio, 360dialog, MessageBird, Vonage) adds its own throughput sub-cap and per-message markup on top. The US marketing pause is layer three. Here is the full stack with numbers, plus the path that has none of them.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "WhatsApp Cloud API wrapper limits: three layers, stacked",
    description:
      "The 80 MPS default, the Twilio sandbox 1-msg-per-3s sub-cap, the 360dialog $49/mo channel fee, and the US +1 marketing pause are all separate limits. They compound. Most guides cover one layer at a time.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Cloud API wrapper limits, fully stacked",
    description:
      "Meta's MPS cap, the BSP's sandbox throttle, and Meta's country-level marketing pauses all compound. Numbers in one place.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "WhatsApp Cloud API wrapper limits" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "WhatsApp Cloud API wrapper limits", url: PAGE_URL },
];

const metaTierMetrics = [
  { value: 80, suffix: " MPS", label: "Default Cloud API throughput per number" },
  { value: 1000, suffix: " MPS", label: "Upgrade ceiling if you qualify" },
  { value: 250, label: "Unique customers per 24h, starting tier" },
  { value: 100000, label: "Unique customers per 24h, top tier before unlimited" },
];

const wrapperLayers = [
  {
    title: "Layer 1. Meta's floor (the Cloud API itself)",
    description:
      "These limits ship with the API. Every wrapper inherits them; nobody removes them.",
    detail: (
      <ul className="mt-3 space-y-2 text-sm text-zinc-700 list-disc list-inside">
        <li>
          <strong>80 messages per second</strong> per phone number, request rate
          capped at about 10 requests per second (each request can bundle
          multiple messages). Upgrade path to 1,000 MPS requires sending to
          100k+ unique users within a 24h window outside the service window
          and holding a yellow-or-green quality rating.
        </li>
        <li>
          <strong>Tiered conversation cap</strong>: business-initiated
          conversations to unique users in a rolling 24h window are gated at
          250, then 1k, 10k, 100k, then unlimited, contingent on quality and
          business verification.
        </li>
        <li>
          <strong>Per-user marketing template caps</strong>: a fixed maximum
          of marketing template sends per user across all businesses,
          enforced by Meta and not visible from your own dashboard.
        </li>
        <li>
          <strong>24-hour customer service window</strong>: once a user messages
          you, free-form replies are allowed for 24 hours; after that you can
          only send approved templates. Crossing the window with anything
          else returns error 63016.
        </li>
      </ul>
    ),
  },
  {
    title: "Layer 2. The BSP wrapper sub-caps and per-message markups",
    description:
      "Every wrapper adds something. Some add a slower sandbox. Some add a fixed monthly fee. Some take a percentage of every message.",
    detail: (
      <ul className="mt-3 space-y-2 text-sm text-zinc-700 list-disc list-inside">
        <li>
          <strong>Twilio sandbox</strong>: capped at 1 message every 3 seconds
          (about 0.33 MPS, roughly 240x slower than Meta's default 80 MPS).
          Sandbox sessions expire 3 days after a user joins and the user has
          to rejoin by re-sending the opt-in code.
        </li>
        <li>
          <strong>360dialog</strong>: pass-through on Meta's per-message
          conversation fee, but a recurring channel fee starting at about
          $49/mo per number (premium plans around $99/mo) plus standard Meta
          charges.
        </li>
        <li>
          <strong>MessageBird (Bird)</strong>: adds about $0.005 markup per
          session message and $0.005 per template message on top of Meta's
          conversation charge.
        </li>
        <li>
          <strong>Vonage</strong>: platform fee per message starting around
          $0.00015, with reported aggregate markup of 10 to 20 percent
          depending on contract terms.
        </li>
        <li>
          <strong>Template approval queue</strong>: most templates clear in
          minutes, but the documented ceiling is about 48 hours per template.
          Bulk submissions, multi-language variants, and rejected/resubmitted
          templates compound this latency before any message can be sent.
        </li>
      </ul>
    ),
  },
  {
    title: "Layer 3. Policy caps Meta layers on top of everything",
    description:
      "Country bans and category gates can void a campaign even when both layers above are green.",
    detail: (
      <ul className="mt-3 space-y-2 text-sm text-zinc-700 list-disc list-inside">
        <li>
          <strong>US marketing pause</strong>: marketing template messages to
          WhatsApp users with US (+1) numbers have not been delivered since
          April 1, 2025. Service, authentication, and utility templates still
          work; the BSP will accept the marketing send and silently drop it.
        </li>
        <li>
          <strong>Quality rating gate</strong>: a red rating freezes tier
          advancement until rating recovers, even if the rest of the account
          is healthy.
        </li>
        <li>
          <strong>Opt-in proof requirement</strong>: marketing templates need
          documented opt-in for each user; some BSPs require uploading the
          opt-in flow URL during template review.
        </li>
        <li>
          <strong>Business verification</strong>: tier upgrades and unlimited
          messaging require Meta business verification, which depends on
          legal documents and can take days to weeks.
        </li>
      </ul>
    ),
  },
];

const wrapperComparisonRows = [
  {
    feature: "Default throughput",
    competitor:
      "Cloud API: 80 MPS per number (upgradable to 1,000 MPS once you qualify).",
    ours:
      "macOS Desktop via accessibility: ~120ms per full AX tree traversal, single-process. Not a thousand-MPS path; designed for one-at-a-time agent workflows.",
  },
  {
    feature: "Slowest layer in the wrapper stack",
    competitor:
      "Twilio sandbox: 1 message every 3 seconds. Production-grade Cloud API access tier still starts at 80 MPS and ramps via Meta-graded quality scoring.",
    ours:
      "There is no sandbox. Send rate is bounded by paste/return latency in WhatsApp Catalyst, roughly 1 message every 1-2 seconds, the same as a human typing.",
  },
  {
    feature: "Per-message cost",
    competitor:
      "Meta conversation fee (varies by category and country) plus BSP markup. MessageBird publishes about $0.005 per message; Vonage about 10-20% markup; 360dialog passes through Meta + $49/mo channel fee.",
    ours:
      "Zero per-message cost. The MCP server runs locally; the only outbound traffic is the WhatsApp Desktop client itself, which uses your existing personal WhatsApp account.",
  },
  {
    feature: "Template approval",
    competitor:
      "Required for all business-initiated messages outside the 24h service window. Approval ceiling around 48h per template; bulk submissions and rejections compound.",
    ours:
      "No templates. Outbound text is just typed into the compose box. Subject to WhatsApp's normal anti-spam behaviour on a personal account.",
  },
  {
    feature: "Country-level blocks",
    competitor:
      "Marketing templates to US (+1) numbers undelivered since 2025-04-01. Other regions have category gates and opt-in proof requirements.",
    ours:
      "Sends are 1:1 messages from your account to a contact, like any human-driven send. Not subject to marketing template gating.",
  },
  {
    feature: "Opt-in proof",
    competitor:
      "Mandatory for marketing templates; BSP review pipelines require documenting the opt-in flow.",
    ours:
      "Not applicable. You can only message your own contacts and recent chats from your own WhatsApp account.",
  },
  {
    feature: "Where the limits live",
    competitor:
      "Documented across Meta + BSP docs + per-country policy notices, often in different places and not stacked together.",
    ours:
      "Documented in the Swift source of whatsapp-mcp-macos. The constraint surface is finite: ~15-level AX depth, ~120ms per tree walk, 350ms paste settle window, and macOS-only.",
  },
];

const stackedDuringSendSteps = [
  {
    title: "1. Throughput cap (Meta)",
    description:
      "Your sender process produces messages at, say, 200 MPS. Cloud API rate-limits to 80 MPS per number. Excess gets 429s or buffered server-side. If you have not been upgraded to 1,000 MPS you stay at 80.",
  },
  {
    title: "2. Wrapper sub-cap (BSP)",
    description:
      "If you are in the Twilio sandbox, the effective cap drops to 0.33 MPS regardless of Meta's 80. If you are on a small 360dialog plan, you also pay the channel fee that month even at zero throughput.",
  },
  {
    title: "3. Per-24h conversation tier (Meta)",
    description:
      "Even if throughput is fine, you cannot start a business-initiated conversation with a unique user beyond your tier (250, 1k, 10k, 100k, unlimited). The 24h window is rolling. Hitting the tier returns a tier-exceeded error per recipient.",
  },
  {
    title: "4. Per-user marketing cap (Meta)",
    description:
      "Individual users can only receive a fixed number of marketing templates per period, summed across all businesses. Your campaign may pass tier and throughput but get filtered per-recipient with no visible counter.",
  },
  {
    title: "5. Country / category gate (Meta policy)",
    description:
      "Marketing template to a +1 number? Not delivered since April 1, 2025. Your BSP returns success, the message never lands. Service and authentication templates are exempt; marketing is not.",
  },
  {
    title: "6. 24-hour customer service window (Meta)",
    description:
      "Any free-form reply outside the 24h window since the user's last message returns error 63016, regardless of throughput or tier. Templates are the only path out.",
  },
];

const desktopChecklistItems = [
  {
    text: "No 80 MPS cap (the cap is human-paced typing, ~1 message per 1-2 seconds, single process)",
  },
  { text: "No 250/1k/10k tier on unique users per 24h" },
  { text: "No per-user marketing template cap (no templates at all)" },
  { text: "No 24h customer service window" },
  { text: "No country-level marketing pause (no marketing template concept)" },
  { text: "No BSP markup (no BSP)" },
  { text: "No template approval queue (no templates)" },
  { text: "No opt-in flow review (you message your own contacts)" },
];

const desktopLimitsItems = [
  { text: "macOS only (uses AXUIElement, a macOS framework)" },
  { text: "Requires WhatsApp Desktop running and Accessibility permission granted" },
  {
    text: "One process per account (you cannot horizontally scale the way a Cloud API number scales)",
  },
  {
    text: "Subject to WhatsApp's normal anti-spam heuristics on your personal account (sending to thousands of strangers will get flagged the same way a real user would)",
  },
  { text: "Not a replacement for high-volume opted-in template broadcasts; that is what the Cloud API exists for" },
];

const faqItems = [
  {
    q: "Why are Cloud API limits and BSP wrapper limits different?",
    a: "Meta publishes the floor: throughput per number (80 MPS default), the rolling-24h tier for business-initiated conversations, per-user marketing caps, and country policy. Each BSP layers something on top: Twilio runs a slower sandbox (1 msg per 3 seconds) and a separate production tier; 360dialog adds a recurring channel fee; MessageBird and Vonage take a per-message markup. Some BSPs add their own template review pipeline before submitting to Meta. So the BSP cannot remove Meta's floor, but it can add caps and costs on top.",
  },
  {
    q: "What is the actual Cloud API throughput cap, and how do I get above it?",
    a: "80 messages per second per phone number is the documented default for the Cloud API. The request rate is around 10 requests per second; each request can bundle multiple messages. The upgrade to 1,000 MPS requires sending to 100,000+ unique users within a 24h window outside the customer service window, holding an unlimited messaging tier, and maintaining a yellow or green quality rating. There is no public path to higher throughput without meeting those conditions.",
  },
  {
    q: "What does the US (+1) marketing pause actually do?",
    a: "Since April 1, 2025, marketing template messages sent to WhatsApp users with US phone numbers have not been delivered. The send call to your BSP returns success and you get a normal delivery callback chain, but the recipient does not see the message. Service templates (account updates, transaction confirmations) and authentication templates (OTP codes) still work. The pause applies to the marketing category only.",
  },
  {
    q: "Is the Twilio sandbox cap the same as the Twilio production cap?",
    a: "No. The sandbox is hard-capped at 1 message every 3 seconds and sandbox sessions expire 3 days after a user joins. The production tier (after Twilio onboards your verified WhatsApp Business Account) inherits Meta's 80 MPS default. The sandbox is a developer sandbox; it is not representative of production throughput.",
  },
  {
    q: "Can I send messages without going through any BSP wrapper?",
    a: "Two paths. First, Meta's own Cloud API (no BSP) which exposes the raw 80 MPS / tiered conversation surface and the template approval pipeline; you still pay Meta's conversation fees. Second, the desktop-app path: drive WhatsApp Desktop with macOS accessibility from a local MCP server. The second path has none of the throughput, tier, template, or markup ceilings, but is bounded by what a single WhatsApp account can plausibly do without getting flagged for spam.",
  },
  {
    q: "How does the 24-hour customer service window interact with the other limits?",
    a: "It is orthogonal. Throughput, tier, and per-user marketing caps gate sends initiated by you. The 24h window gates whether your reply can be free-form or has to be a template. Even if your account has unlimited tier and 1,000 MPS throughput, a reply 25 hours after the user's last message must be a template, or the BSP returns error 63016.",
  },
  {
    q: "Where does the desktop-app path break down?",
    a: "It is macOS only and binds to a single WhatsApp Desktop process. It cannot scale to ten thousand sends per second the way a Cloud API number can; it sends at human pace. It is not a substitute for broadcast marketing templates that need to land at scale. It is the right tool when an AI agent needs to act on your behalf across your existing chats: triaging inbound, replying with context, searching contact history, sending one-off outbounds.",
  },
  {
    q: "Does whatsapp-mcp-macos count as a 'wrapper'?",
    a: "No, and that is the point. A wrapper is software that sits between you and the Cloud API. whatsapp-mcp-macos does not call the Cloud API at all. It drives the genuine WhatsApp Desktop client through macOS accessibility (AXUIElement). The client connects to WhatsApp over the same path your phone does; the MCP server only controls the local UI. There is no Meta developer account, no template review, no BSP, and no per-message fee.",
  },
];

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline:
                "WhatsApp Cloud API wrapper limits: the three-layer ceiling no one stacks for you",
              description:
                "Meta's 80 MPS default, tiered 24h conversation caps, BSP-specific sandbox throttles and per-message markups, and the US +1 marketing pause are all separate limits. Stacked, with numbers and sources.",
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "WhatsApp MCP for macOS",
              publisherUrl: "https://whatsapp-mcp-macos.com",
              url: PAGE_URL,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListSchema(breadcrumbSchemaItems)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(faqItems)),
        }}
      />

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-4xl mx-auto px-6 pt-8 pb-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
          WhatsApp Cloud API wrapper limits are a{" "}
          <GradientText>three-layer stack</GradientText>, not a single number
        </h1>
        <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
          Most guides quote the 80 MPS default and stop. The actual ceiling is
          Meta's throughput + tier + per-user marketing cap, then the BSP
          wrapper's sandbox throttle and per-message markup, then country
          policy like the US (+1) marketing pause. They compound. Here is the
          full stack with literal numbers, plus what a non-API path looks like
          when none of them apply.
        </p>
        <div className="mt-6">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="9 min read"
          />
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 my-8">
        <GlowCard>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold mb-3">
              Direct answer (verified 2026-05-20)
            </p>
            <p className="text-zinc-800 leading-relaxed">
              Three layers stack on top of each other. Meta caps throughput at{" "}
              <strong>80 MPS per number</strong> (upgradable to 1,000 MPS if
              you qualify) and tiers business-initiated conversations at{" "}
              <strong>250 → 1k → 10k → 100k → unlimited</strong> unique users
              per rolling 24 hours. BSP wrappers layer their own restrictions
              on top: the Twilio sandbox caps at{" "}
              <strong>1 message every 3 seconds</strong>, 360dialog charges a{" "}
              <strong>$49+/mo channel fee</strong> on top of Meta pass-through,
              MessageBird adds about <strong>$0.005 markup per message</strong>,
              Vonage charges a 10 to 20 percent markup. The third layer is
              country policy: marketing templates to US (+1) numbers have{" "}
              <strong>not been delivered since April 1, 2025</strong>, and any
              reply outside the 24-hour customer service window must be a
              template or it returns error 63016.
            </p>
            <p className="mt-3 text-sm text-zinc-600">
              Sources:{" "}
              <a
                href={META_LIMITS}
                className="text-teal-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Meta messaging limits
              </a>
              ,{" "}
              <a
                href={TWILIO_SANDBOX}
                className="text-teal-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twilio WhatsApp sandbox
              </a>
              ,{" "}
              <a
                href={DIALOG_PRICING}
                className="text-teal-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                360dialog pricing
              </a>
              ,{" "}
              <a
                href={VONAGE_PRICING}
                className="text-teal-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vonage WhatsApp pricing
              </a>
              .
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <MetricsRow metrics={metaTierMetrics} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The three layers, in order
        </h2>
        <p className="text-zinc-700 mb-6 leading-relaxed">
          A send that fails could be hitting any one of these. The visible
          error usually points at the topmost layer (your BSP's 429), but the
          binding constraint is often two layers down. Knowing which layer is
          binding is the difference between waiting for tier promotion,
          renegotiating with the BSP, switching template categories, or
          changing the country mix of the campaign.
        </p>
        <StepTimeline steps={wrapperLayers} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What happens to one send as it passes through the stack
        </h2>
        <p className="text-zinc-700 mb-6 leading-relaxed">
          Walking through every gate a single business-initiated marketing
          template hits. Each layer can deny it independently. The
          documentation for each layer lives in a different place; the layers
          do not share an error vocabulary.
        </p>
        <StepTimeline steps={stackedDuringSendSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <ProofBanner
          quote="Cloud API limit is 80 messages per second, while the On-premise API is 13 messages per second."
          source="Documented Meta default throughput cap, per public BSP and academy references"
          metric="80 MPS"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Cloud API + wrapper stack vs. driving WhatsApp Desktop on macOS
        </h2>
        <p className="text-zinc-700 mb-6 leading-relaxed">
          The alternative is not a faster wrapper; it is a different surface
          entirely.{" "}
          <a
            href={GITHUB}
            className="text-teal-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            whatsapp-mcp-macos
          </a>{" "}
          does not call the Cloud API. It attaches to the WhatsApp Desktop
          process via macOS accessibility (AXUIElement), walks the UI tree,
          posts CGEvent clicks, and pastes text into the compose box. The
          Cloud API limits stop applying because nothing in this path is a
          Cloud API client.
        </p>
        <ComparisonTable
          productName="WhatsApp MCP on macOS"
          competitorName="WhatsApp Cloud API via BSP wrapper"
          rows={wrapperComparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12 grid md:grid-cols-2 gap-6">
        <div>
          <AnimatedChecklist
            title="Limits that do not exist on the desktop-app path"
            items={desktopChecklistItems}
          />
        </div>
        <div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 h-full">
            <h3 className="text-lg font-semibold text-zinc-900 mb-3">
              Limits that do exist on the desktop-app path
            </h3>
            <ul className="space-y-2 text-sm text-zinc-700">
              {desktopLimitsItems.map((item) => (
                <li key={item.text} className="flex gap-2">
                  <span className="text-zinc-400 mt-1">·</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-zinc-500">
              This is not a replacement for high-volume opted-in broadcasts.
              It is the right tool for AI agents that need to act on your
              behalf across your existing chats.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Which limit binds for which use case
        </h2>
        <ul className="space-y-3 text-zinc-700 leading-relaxed">
          <li>
            <strong className="text-zinc-900">Sandbox prototype:</strong>{" "}
            Twilio's sandbox at 1 msg per 3 seconds is the binding limit. Meta
            tier and country policy are irrelevant because you never reach
            them.
          </li>
          <li>
            <strong className="text-zinc-900">Single-tenant SaaS</strong>{" "}
            sending a few thousand transactional alerts per day: Meta's 80
            MPS is plenty, the BSP markup is the most expensive layer, and
            the 24h service window is the gate you keep hitting on replies.
          </li>
          <li>
            <strong className="text-zinc-900">
              Marketing broadcast to global list:
            </strong>{" "}
            Meta's per-user marketing cap and the US (+1) pause bind first;
            then 24h conversation tier; throughput last. Switching BSPs does
            not move any of these.
          </li>
          <li>
            <strong className="text-zinc-900">
              AI agent reading + replying for one person:
            </strong>{" "}
            none of the Cloud API limits apply when the agent drives WhatsApp
            Desktop directly. The binding constraint is single-process and
            macOS-only.
          </li>
          <li>
            <strong className="text-zinc-900">
              Customer support handling inbound at scale:
            </strong>{" "}
            the 24h service window is the dominant constraint; throughput
            rarely matters because inbound paces outbound. Tier and policy
            apply only when initiating new conversations.
          </li>
        </ul>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <FaqSection items={faqItems} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Hitting one of the layers and not sure which?"
          description="15 minutes to walk through the stack against your specific send pattern and figure out whether the answer is a tier upgrade, a BSP switch, a template restructure, or a desktop-app path."
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination={CAL_LINK}
        site="WhatsApp MCP"
        description="Stuck on a Cloud API limit? Book 15 minutes."
      />
    </article>
  );
}
