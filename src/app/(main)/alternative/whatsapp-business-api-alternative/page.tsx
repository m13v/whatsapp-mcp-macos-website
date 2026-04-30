import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  ComparisonTable,
  ProofBanner,
  BookCallCTA,
  AnimatedChecklist,
  GlowCard,
  HorizontalStepper,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/alternative/whatsapp-business-api-alternative";
const PUBLISHED = "2026-04-30";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "WhatsApp Business API alternative: the four real paths (and which one you actually want)",
  description:
    "Most 'WhatsApp Business API alternative' lists are rosters of BSPs that resell the same Cloud API. Here is the honest taxonomy: four real non-API paths, what each one actually replaces, and where a local accessibility-driven MCP server fits for personal accounts and AI agents.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "WhatsApp Business API alternative: four real paths, not ten BSP wrappers",
    description:
      "Wati, Twilio, Periskope, Tidio, Gallabox: all reselling Meta's Cloud API. The actual non-API alternatives are open-source web clients, web-automation SaaS, and local desktop drivers. Here is when each one is right.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "WhatsApp Business API alternative, the honest taxonomy",
    description:
      "Four real paths instead of one. Most 'alternatives' are the same API rebadged. The local desktop driver is the only one that lets a personal account stay personal.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Alternatives", href: "/alternative" },
  { label: "WhatsApp Business API alternative" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  {
    name: "Alternatives",
    url: "https://whatsapp-mcp-macos.com/alternative",
  },
  { name: "WhatsApp Business API alternative", url: PAGE_URL },
];

const fourIntentsSteps = [
  {
    title: "Cheaper or simpler BSP",
    description:
      "You already accept the Business API model. You just want a friendlier console or a better per-message rate.",
  },
  {
    title: "No business verification",
    description:
      "You do not have a registered legal entity, or you do not want to start one just to ping users.",
  },
  {
    title: "Use a personal number",
    description:
      "The number that should send the message is one you also use yourself. The Cloud API requires a number not signed in to consumer WhatsApp.",
  },
  {
    title: "Let an AI agent send messages",
    description:
      "You want Claude, Cursor, or your own agent to handle messaging on your behalf, with no template approval lag and no opt-in spreadsheet.",
  },
];

const compareRows = [
  {
    feature: "What it really is",
    competitor:
      "BSP reseller. A console wrapped around Meta's WhatsApp Cloud API.",
    ours:
      "Local Swift binary that drives the WhatsApp Catalyst app via macOS accessibility APIs. Ships as an npm package, runs as a stdio child of an MCP host.",
  },
  {
    feature: "Account on the other end",
    competitor:
      "A registered Business Cloud API number that no longer works in the consumer app the normal way. Separate identity from your personal one.",
    ours:
      "Your own WhatsApp account, exactly as you already use it on the desktop.",
  },
  {
    feature: "Business verification required",
    competitor:
      "Yes. Meta still has to verify the underlying Business Account, and the BSP just facilitates it.",
    ours: "No. The MCP server does not interact with Meta's business surface.",
  },
  {
    feature: "Template approval and opt-in record",
    competitor:
      "Required for outbound outside the 24-hour service window. The BSP usually adds its own template review on top.",
    ours:
      "Not applicable. The server types into the same chat thread the human would type into. Same WhatsApp consumer terms apply.",
  },
  {
    feature: "Per-message cost",
    competitor:
      "Markup on Meta's per-message rate. Marketing templates roughly $0.025 to $0.1365 plus the BSP fee.",
    ours: "Free. MIT-licensed npm package. Local execution.",
  },
  {
    feature: "Time from zero to first message",
    competitor:
      "Days to weeks (business verification + template review + BSP onboarding).",
    ours:
      "Minutes. npm install, grant Accessibility, restart your MCP host.",
  },
  {
    feature: "Where it runs",
    competitor:
      "Hosted by the BSP. You point a webhook at their service or call their REST endpoint.",
    ours:
      "On the same Mac as the WhatsApp app. Local stdio transport only.",
  },
  {
    feature: "Delivery confirmation",
    competitor:
      "Async webhook events: sent, delivered, read, failed. Integration has to track state.",
    ours:
      "Synchronous. 1.0s after send, the server re-walks the AX tree and looks for an AXGenericElement starting with 'Your message, '.",
  },
  {
    feature: "Multi-tenant SaaS friendly",
    competitor:
      "Yes. Per-tenant tokens, scoped permissions, audit logs.",
    ours:
      "No. Single-tenant by construction. The server runs as the operator.",
  },
  {
    feature: "Honest fit",
    competitor:
      "Verified businesses sending opted-in transactional or marketing messages at volume.",
    ours:
      "Solo founders, individual operators, and AI agents acting on behalf of one person on one Mac.",
  },
];

const verificationCode = `// Sources/WhatsAppMCP/main.swift
// Post-send verification block. Runs after the return key.

pressReturn()
Thread.sleep(forTimeInterval: 1.0)

let postElements = traverseAXTree(pid: pid)
let genericElements = findElements(in: postElements,
                                   role: "AXGenericElement")

var lastSentMessage: String? = nil
for el in genericElements {
    let desc = cleanUnicode(el.description ?? "")
    if desc.hasPrefix("Your message, ") {
        let rest = String(desc.dropFirst("Your message, ".count))
        var text = rest
        if let timeRange = text.range(
            of: #",\\s+\\d{1,2}:\\d{2}\\s*[APap][Mm]"#,
            options: .regularExpression) {
            text = String(text[text.startIndex..<timeRange.lowerBound])
        }
        lastSentMessage = text.trimmingCharacters(
            in: CharacterSet(charactersIn: ", "))
    }
}

// verified == true iff what we typed matches the bubble we now see.
// No webhook. No Meta endpoint. The chat is the receipt.`;

const cloudApiCode = `// Same operation via WhatsApp Cloud API (any BSP wraps something like this).
// You also need: verified business, approved template, opt-in record,
// and a webhook receiving status callbacks asynchronously.

const res = await fetch(
  \`https://graph.facebook.com/v21.0/\${PHONE_NUMBER_ID}/messages\`,
  {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${ACCESS_TOKEN}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: "15551234567",
      type: "template",
      template: {
        name: "hello_friendly_v2",       // pre-approved, categorized
        language: { code: "en_US" },
        components: [
          { type: "body", parameters: [{ type: "text", text: "Sam" }] },
        ],
      },
    }),
  },
);

// 200 means "Meta accepted the request", not "delivered".
// Real delivery, read receipts, and failures arrive on the webhook.`;

const intentMappingItems = [
  {
    text: "Cheaper or simpler BSP -> different BSP. You are still on the Cloud API. Twilio, 360dialog, Infobip, Wati, Gallabox all wrap it.",
  },
  {
    text: "No business verification -> open-source web client (Baileys, whatsapp-web.js) or local desktop driver. Cost: account-ban risk for the libraries; macOS-only constraint for the desktop driver.",
  },
  {
    text: "Personal number must stay personal -> local desktop driver is the only path. Cloud API requires a number that is not signed in to consumer WhatsApp.",
  },
  {
    text: "AI agent on your own account -> local desktop driver via MCP. Web clients work too, but you are running headless Chromium against the most heavily monitored automation surface Meta operates.",
  },
];

const fourPathsRows = [
  {
    feature: "BSP reseller (Wati, Twilio, 360dialog, Infobip, Periskope, Wapikit)",
    competitor:
      "Hosted SaaS. Adds an inbox, templates UI, simple flow builder. Underneath: Meta's Cloud API.",
    ours:
      "Right when you have a verified business and want a console. Wrong when the user search 'alternative' meant 'I do not have a verified business'.",
  },
  {
    feature: "Open-source web client (Baileys, whatsapp-web.js)",
    competitor:
      "Self-hosted Node libraries that talk to WhatsApp's own multi-device protocol or drive whatsapp-web.com via a browser.",
    ours:
      "Free, no Meta paperwork, runs anywhere. Account-ban risk is real and ongoing. Treat any operating account as disposable.",
  },
  {
    feature: "Hosted WhatsApp Web automation",
    competitor:
      "Grey-market SaaS that runs your account inside their Selenium-style browser farm and exposes it as an API.",
    ours:
      "Convenient but combines the policy risk of web automation with the trust risk of handing your session cookie to a vendor. Avoid for any account you would mind losing.",
  },
  {
    feature: "Local desktop driver (WhatsApp MCP for macOS)",
    competitor:
      "Local npm package. Drives the official Catalyst app via macOS Accessibility. Talks to the AI host over MCP stdio.",
    ours:
      "Right when the sender is one human on a Mac and the receiver is someone they normally chat with. Wrong for high-volume opted-in business outbound (use the Cloud API).",
  },
];

const installSteps = [
  {
    title: "Install",
    description: "npm install -g whatsapp-mcp-macos",
  },
  {
    title: "Permit",
    description:
      "System Settings, Privacy and Security, Accessibility. Add your terminal (or Claude Code, Cursor).",
  },
  {
    title: "Wire up",
    description:
      "Add a stdio entry under mcpServers in ~/.claude.json (or your host's equivalent), pointing at the whatsapp-mcp binary.",
  },
  {
    title: "Send",
    description:
      "Restart the host. Tools/list now shows whatsapp_search, whatsapp_open_chat, whatsapp_send_message. Your agent can ping a friend.",
  },
];

const faqItems = [
  {
    q: "Is there an actual drop-in replacement for the WhatsApp Business API?",
    a: "Not in the Meta-supplied sense. There is no first-party REST endpoint that accepts the same shape and skips the verified-business and template gates. Every BSP that markets itself as an 'alternative' is reselling Meta's WhatsApp Cloud API with their own console on top, and inherits all the same gates. The genuine non-API paths are different products entirely: open-source libraries that speak WhatsApp's multi-device protocol, hosted SaaS that runs WhatsApp Web for you, and local drivers that act on the official desktop app via OS accessibility frameworks. Each replaces a different slice of what people actually want when they search 'alternative'.",
  },
  {
    q: "Why are Wati, Twilio, and Periskope listed as alternatives if they all use the Cloud API underneath?",
    a: "Marketing convention. The 'alternative' framing in those listings means 'a different vendor for the same job', not 'a different protocol path'. Wati, Twilio, 360dialog, Infobip, Gallabox, Tidio, respond.io, AiSensy, Interakt and most of the rest are Business Solution Providers; they hold a relationship with Meta and resell the Cloud API plus their own UI, CRM glue, and template management. If your blocker is the price of one BSP, switching to another can help. If your blocker is the Business API model itself (verification, templates, opt-in, separate number, per-message billing), switching BSPs changes nothing.",
  },
  {
    q: "What about Baileys and whatsapp-web.js? Are those safe to use in production?",
    a: "Define safe. Both are mature, widely used, and free. Baileys speaks WhatsApp's multi-device protocol directly; whatsapp-web.js drives the web client through Puppeteer. They work, and a lot of teams ship with them. The risk is account-level: WhatsApp's anti-automation systems do flag and ban accounts that use these libraries, especially for outbound that looks bulk or business-like. The risk is not deterministic; some accounts run for years, some get banned in days. The honest framing: treat any account you operate this way as disposable and do not use a number you would be sad to lose. Read the libraries' own README files for current banning patterns.",
  },
  {
    q: "How is the WhatsApp MCP server different from running Baileys with an LLM in front of it?",
    a: "Two main differences. First, surface: Baileys speaks the multi-device protocol over websockets, which is the surface Meta most actively monitors for non-WhatsApp clients. The MCP server does not speak the protocol at all; it drives the official WhatsApp Catalyst app on your Mac through the same accessibility framework that VoiceOver and other assistive tools use. From Meta's perspective the network traffic is just the official client doing its job. Second, fit: the MCP server is built for a single human's account on a single Mac and exposes itself as MCP tools an AI host calls over stdio. Baileys is a library you wire into your own service; you get more flexibility and more responsibility (session storage, reconnects, multi-device pairing, and the ban-mitigation playbook are all yours).",
  },
  {
    q: "What does the WhatsApp MCP server do for delivery confirmation if there is no webhook?",
    a: "It re-reads the chat. After the send keystroke fires, the server sleeps 1.0 seconds, walks the WhatsApp accessibility tree, collects every AXGenericElement, and looks for one whose accessibility description begins with the literal prefix 'Your message, '. WhatsApp's Catalyst client labels each outgoing bubble with that prefix plus the message body and a trailing time. The server strips the time suffix using the regex ',\\\\s+\\\\d{1,2}:\\\\d{2}\\\\s*[APap][Mm]' and compares the remaining text to what was just typed. Match returns verified:true in the JSON-RPC response. Mismatch returns verified:false with the visible bubble in a warning field. The chat is the receipt; there is no Meta endpoint to ask.",
  },
  {
    q: "Can the MCP server reach groups, status updates, and broadcast lists?",
    a: "Groups and one-to-one chats: yes, anything that appears in the search and chat list of the desktop app is reachable. The server uses whatsapp_search to find the group by name, whatsapp_open_chat to open it, and whatsapp_send_message to type. Status updates and the broadcast-list mechanic on the consumer app are not currently first-class tools because the desktop app has limited surface for them. The README's tool table is the source of truth for what is exposed today.",
  },
  {
    q: "What about Windows or Linux?",
    a: "Out of scope. The server depends on the macOS Accessibility framework (AXUIElement, kAXUIElementRoleAttribute, the Catalyst app's specific subrole tree). Porting would mean rewriting the entire interaction layer against UI Automation on Windows or AT-SPI on Linux, plus accommodating the very different WhatsApp clients there. If you are not on a Mac, the closest equivalents are the open-source web client libraries (Baileys, whatsapp-web.js), with the account-risk caveat above.",
  },
  {
    q: "If I am building outbound at any real volume, am I going back to the Business API?",
    a: "Yes. Once you are sending opted-in messages to thousands of recipients per day, you want the Business API regardless of which BSP packages it. The MCP server is bottlenecked by one Mac running one WhatsApp app; it is not designed for fan-out. The split is clean: agent-driven personal messaging, internal coordination, and one-on-one workflows belong on the local driver; high-volume verified-business outbound belongs on the Cloud API. They can coexist in the same MCP host config: one stdio entry for the local server, one HTTP entry for a Cloud-API wrapping MCP, and the agent picks based on which account is supposed to send.",
  },
  {
    q: "Is using the MCP server against WhatsApp's terms?",
    a: "It uses the official desktop app and macOS Accessibility, which are sanctioned APIs (Accessibility is the same surface VoiceOver uses). The WhatsApp consumer terms still govern what you do with your account. Sending the kind of messages you would normally type to people you would normally type them to is fine. Using any automation, including the MCP server, to mass-message strangers, scrape contact graphs, or otherwise behave like a business on a personal account, is the kind of activity that gets accounts banned, exactly as it would if you did the same thing manually. Read the consumer terms before pushing volume.",
  },
  {
    q: "Where does the AI agent angle actually fit in?",
    a: "The MCP server registers as a stdio MCP server in any host that speaks the protocol (Claude Code, Cursor, Windsurf, Claude Desktop, any custom client). Once registered, an agent can call whatsapp_search to find a contact by name, whatsapp_open_chat to focus the chat, whatsapp_get_active_chat to read recent context, and whatsapp_send_message to send. The recommended workflow in the README is exactly that four-step sequence. From the agent's side it is just typed tool calls; from the recipient's side it is a normal message in your normal chat thread. That is the use case that none of the BSP-style alternative listings address.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "WhatsApp Business API alternative: the four real paths (and which one you actually want)",
    description:
      "An honest taxonomy of what 'WhatsApp Business API alternative' means in practice. Most listed alternatives are BSPs reselling Meta's Cloud API. The genuine non-API paths are open-source web client libraries, hosted web-automation SaaS, and local desktop drivers like the WhatsApp MCP server for macOS. The article maps the four most common reasons people search for an alternative to the path that actually solves each one, with code samples for both the Cloud API call and the local accessibility-driven verification block.",
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

export default function WhatsappBusinessApiAlternativePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen pb-24">
        <div className="max-w-3xl mx-auto px-6 pt-10">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <header className="max-w-3xl mx-auto px-6 mt-8">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
            Honest taxonomy, not a BSP roster
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
            WhatsApp Business API alternative: the four real paths (and which one you actually want).
          </h1>
          <p className="text-lg text-zinc-700 leading-relaxed mb-4">
            Almost every page that ranks for this question is a list of ten
            vendors. Open any three of them side by side. Wati, Twilio,
            360dialog, Infobip, AiSensy, Interakt, Gallabox, respond.io,
            Periskope, Tidio: most of these are reselling Meta&apos;s WhatsApp
            Cloud API with their own console on top. The relabel does not
            change what is underneath.
          </p>
          <p className="text-lg text-zinc-700 leading-relaxed mb-4">
            If you came here because the BSP markup is too high, swapping
            BSPs is a real fix. If you came here for any other reason, the
            BSP roster does not help.
          </p>
        </header>

        <div className="max-w-3xl mx-auto px-6 mt-6">
          <ArticleMeta
            datePublished={PUBLISHED}
            readingTime="9 min read"
            author="Matthew Diakonov"
            authorRole="Written with AI"
          />
        </div>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <GlowCard>
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-3">
                Direct answer, verified 2026-04-30
              </p>
              <p className="text-zinc-900 text-lg leading-relaxed mb-3">
                There is no first-party drop-in replacement. The honest
                non-API alternatives are four distinct paths.
              </p>
              <ol className="list-decimal pl-5 text-zinc-700 leading-relaxed space-y-2">
                <li>
                  Switch to a different BSP. You are still on Meta&apos;s{" "}
                  <a
                    href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                  >
                    WhatsApp Cloud API
                  </a>
                  .
                </li>
                <li>
                  Self-host an open-source web client like{" "}
                  <a
                    href="https://github.com/WhiskeySockets/Baileys"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                  >
                    Baileys
                  </a>{" "}
                  or{" "}
                  <a
                    href="https://github.com/pedroslopez/whatsapp-web.js"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                  >
                    whatsapp-web.js
                  </a>
                  . Free, no Meta paperwork, account-ban risk is real.
                </li>
                <li>
                  Use a hosted WhatsApp Web automation SaaS. Same risk plus
                  vendor session-cookie risk.
                </li>
                <li>
                  Run a local accessibility-driven driver like the{" "}
                  <a
                    href="https://github.com/m13v/whatsapp-mcp-macos"
                    className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                  >
                    WhatsApp MCP server for macOS
                  </a>
                  . The only path that lets a personal number stay personal.
                </li>
              </ol>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The four reasons you typed this into Google
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Every &quot;alternative&quot; query is one of these four. Pick
            your row first; the right path falls out.
          </p>
          <HorizontalStepper steps={fourIntentsSteps} />
          <p className="text-zinc-700 leading-relaxed mt-8">
            Most ranking pages assume row one. They list ten BSPs and call
            it a day. Rows two, three, and four are where the actual
            interesting work lives, and where Meta does not sell you a
            product directly.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Map each intent to the path that actually answers it
          </h2>
          <AnimatedChecklist
            title="Intent to path, no marketing fog"
            items={intentMappingItems}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 max-w-3xl mx-auto">
            What each non-API path actually is
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl mx-auto">
            Four rows, each with the honest version of what the thing is
            and where it fits. The right column is when to choose it; the
            left column is what it is.
          </p>
          <ComparisonTable
            heading="Non-API paths, side by side"
            intro="The Business Cloud API itself sits on top of all of this. These are the paths people pick when the API model is the wrong shape for the job."
            productName="When to pick"
            competitorName="What it really is"
            rows={fourPathsRows}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Where the local desktop driver fits, and why it is on this list
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The path the rest of the alternatives lists ignore is the one
            where nothing is hosted, no business is registered, and the
            account on the other end is just a person. That is the
            agent-on-a-Mac case. It is the case the WhatsApp MCP server is
            designed for.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Mechanically: the server is a Swift binary, distributed as an
            npm package. After install it sits as a stdio child of any MCP
            host (Claude Code, Cursor, Windsurf, Claude Desktop). It calls
            into the macOS Accessibility framework to walk the WhatsApp
            Catalyst app&apos;s accessibility tree, click search results,
            paste text into the compose field, press return, and read the
            chat back to confirm what it just sent.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The interesting part is the confirmation. The Cloud API
            answers a send with &quot;Meta accepted the request&quot;.
            Real delivery status arrives later on a webhook. The local
            driver answers with whether the bubble it just typed is now
            visible in the chat, by reading the chat. Same wall-clock
            latency window, completely different mechanism.
          </p>

          <ProofBanner
            metric="0 webhooks"
            quote="The chat is the receipt. The server re-walks the WhatsApp accessibility tree 1.0s after pressing return and looks for an AXGenericElement whose accessibility description begins with the literal prefix 'Your message, '. Match returns verified:true. No Meta endpoint."
            source="Sources/WhatsAppMCP/main.swift, post-send block of handleSendMessage"
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What &quot;send one message&quot; looks like in code, both ways
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Cloud API first. The call is short. The work is the
            preconditions: a token tied to a verified business, a template
            Meta has reviewed, an opted-in recipient, and a webhook ready
            for what happens later.
          </p>
          <AnimatedCodeBlock
            code={cloudApiCode}
            language="javascript"
            filename="WhatsApp Cloud API call (TypeScript)"
          />

          <p className="text-zinc-700 leading-relaxed mt-10 mb-6">
            Local driver next. The send itself is a couple of accessibility
            calls. The post-send block is the part worth reading: it is
            how this path skips the webhook entirely.
          </p>
          <AnimatedCodeBlock
            code={verificationCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 max-w-3xl mx-auto">
            Cloud API path versus local driver path, line by line
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl mx-auto">
            One BSP-level row would just compare two things wrapped around
            the same API. This row compares the Cloud API itself to the
            non-API path that does not use it.
          </p>
          <ComparisonTable
            heading="Cloud API vs local accessibility-driven driver"
            intro="The cleanest split in this whole space. Pick by what the sending account is, not by which feature checkbox is shinier."
            productName="WhatsApp MCP for macOS"
            competitorName="WhatsApp Cloud API (any BSP)"
            rows={compareRows}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            If the local driver path is the right one, here is the entire setup
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            For comparison with multi-week verified-business onboarding,
            here is the full sequence on the local side. It assumes you
            already have WhatsApp signed in on your Mac, which most readers
            do.
          </p>
          <HorizontalStepper steps={installSteps} />
          <p className="text-zinc-700 leading-relaxed mt-8">
            The README at{" "}
            <a
              href="https://github.com/m13v/whatsapp-mcp-macos"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              github.com/m13v/whatsapp-mcp-macos
            </a>{" "}
            has the exact JSON snippet for the host config and the full tool
            table. Eleven tools today: status, start, quit, search, open
            chat, get active chat, send message, read messages, scroll
            search, list chats, navigate.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            When the Cloud API is still the right answer
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The local driver is not a replacement at scale. It is one Mac
            running one WhatsApp app. If your job is to send opted-in
            shipping notifications to ten thousand customers a day, you
            want the Cloud API, and you want a competent BSP wrapping it.
            That is what the BSP rosters are for. Use them; just be honest
            with yourself that you are picking among Cloud API resellers,
            not finding a true alternative.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            The two paths happily coexist in one MCP host config: a local
            stdio entry for the personal account driver, an HTTP entry for
            a Cloud-API-wrapping MCP, and the agent picks based on which
            account should send. That is the configuration to reach for if
            both audiences matter.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Not sure which of the four paths fits your case?"
          description="If you have a specific use case in mind and the BSP listings have left you more confused than informed, book 30 minutes. Faster than reading another roundup."
        />

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <FaqSection items={faqItems} />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Map your WhatsApp use case to the right path in 30 min."
        />
      </article>
    </>
  );
}
