import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  ComparisonTable,
  BookCallCTA,
  GlowCard,
  SequenceDiagram,
  AnimatedChecklist,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/alternative/whatsapp-mcp-vs-business-api";
const PUBLISHED = "2026-05-20";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "WhatsApp MCP via accessibility vs the Business API: the agent's tool surface decides",
  description:
    "Compare the two paths by what an AI agent actually sees through each. WhatsApp MCP exposes 11 named tools, six of them read-side against your existing contacts and chat history. The Business API exposes graph endpoints that have no read access to your contact directory at all. That asymmetry is what makes the choice obvious for personal-account agents.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "WhatsApp MCP via accessibility vs the Business API",
    description:
      "Eleven MCP tools, including contact search and chat-history reads. The Business API has zero read-side against your contacts. The asymmetry is what makes the choice obvious.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "WhatsApp MCP via accessibility vs the Business API",
    description:
      "The agent's tool surface is the real comparison axis. Six read-side tools on the accessibility path. Zero contact-directory access on the Business API.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Alternatives", href: "/alternative" },
  { label: "MCP via accessibility vs Business API" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  {
    name: "Alternatives",
    url: "https://whatsapp-mcp-macos.com/alternative",
  },
  { name: "MCP via accessibility vs Business API", url: PAGE_URL },
];

const mcpToolListCode = `// Sources/WhatsAppMCP/main.swift — the tool registry an MCP host sees.
// Every entry here is one named function the LLM is allowed to call.

let allTools = [
    statusTool,           // whatsapp_status         — is WhatsApp running + accessibility granted
    startTool,            // whatsapp_start          — launch the app if not running
    quitTool,             // whatsapp_quit           — close the app
    getActiveChatTool,    // whatsapp_get_active_chat — which chat is currently open
    listChatsTool,        // whatsapp_list_chats     — read sidebar: names, previews, unread counts
    searchTool,           // whatsapp_search         — search YOUR contacts and chats by name
    openChatTool,         // whatsapp_open_chat      — click the Nth search result
    scrollSearchTool,     // whatsapp_scroll_search  — load more search results
    readMessagesTool,     // whatsapp_read_messages  — pull history of the open chat
    sendMessageTool,      // whatsapp_send_message   — type and send into the open chat
    navigateTool,         // whatsapp_navigate       — switch tabs (chats / archived / starred...)
]
// Six of these (list_chats, search, open_chat, scroll_search, read_messages,
// get_active_chat) are pure read-side. They turn the WhatsApp window into a
// structured data source the agent can query before deciding what to write.`;

const cloudApiSurfaceCode = `// What the WhatsApp Cloud API exposes to an integration.
// Reference: developers.facebook.com/docs/whatsapp/cloud-api/reference
// The shape is: send to a number, receive on a webhook, manage templates.

POST /{PHONE_NUMBER_ID}/messages          // outbound: text / template / media / interactive
POST /{PHONE_NUMBER_ID}/messages          // reply with message_id reference (mark as read)
POST /{PHONE_NUMBER_ID}/media             // upload media to get a media_id
GET  /{MEDIA_ID}                          // fetch metadata + signed URL for received media
GET  /{MEDIA_ID}                          // delete uploaded media
POST /{WABA_ID}/message_templates         // create a template
GET  /{WABA_ID}/message_templates         // list templates YOU own (not chats, not contacts)
POST /{PHONE_NUMBER_ID}/register          // register a number with the API
POST /{PHONE_NUMBER_ID}                   // update display name, business profile

// Inbound surface is a webhook your server hosts:
POST /your-webhook                        // body: { messages: [...], statuses: [...] }
// The webhook only delivers messages from users who messaged YOUR business
// number first. It does not give you their address book entry, their name
// as you saved it, or any history before their first inbound.

// There is no endpoint to list your contacts, search by name, list your
// chats, or page back through history. There is no concept of "your
// contacts" because the Business API is the business's view, not yours.`;

const operationRows = [
  {
    feature: "Search your contacts by name",
    ours:
      "whatsapp_search(\"Sarah\"). Returns ranked results from the WhatsApp sidebar's search index: chats section, contacts section, with names as you saved them, last-message preview, and timestamp. Backed by accessibility tree traversal of the sidebar's results list.",
    competitor:
      "Not available. The Cloud API has no contact directory endpoint. You can only message a phone number you already know (in E.164 form), and you only have phone numbers of users who have messaged your registered business number first.",
  },
  {
    feature: "List your visible chats",
    ours:
      "whatsapp_list_chats(filter: \"all\" | \"unread\" | \"favorites\" | \"groups\"). Returns chat names, last-message previews, and unread counts. Same data the WhatsApp sidebar renders to a human user.",
    competitor:
      "Not available. The closest analog is querying your own webhook database of inbound messages. The Cloud API never gives you a list of who you have chats with.",
  },
  {
    feature: "Read history of an open chat",
    ours:
      "whatsapp_read_messages(limit: 20). Returns sender, text, time, and isFromMe for each message currently rendered in the chat view. Scrolling back loads more (via the WhatsApp app's own lazy-load).",
    competitor:
      "Not available. The Cloud API only delivers inbound webhook events from the moment your webhook is wired up. Anything before that, or anything sent from the consumer app on the same number, is invisible to the API.",
  },
  {
    feature: "Send to someone you know personally",
    ours:
      "Pipeline: whatsapp_search + whatsapp_open_chat + whatsapp_send_message. Sends from the personal account signed in to the desktop app. The recipient sees the message exactly as they would from any other WhatsApp conversation with you.",
    competitor:
      "Requires a separate Business Cloud API number that is not signed in to the consumer app. The recipient sees a verified-business badge and the business display name, not your personal identity.",
  },
  {
    feature: "Send to someone outside the 24-hour window",
    ours:
      "Same pipeline. Free-form, no template review, no 24-hour gate. Subject to WhatsApp's consumer terms (no spammy outbound to strangers).",
    competitor:
      "Requires a pre-approved template. Templates are categorized as Marketing / Utility / Authentication and reviewed by Meta. Marketing templates are billed per message by destination country.",
  },
  {
    feature: "Confirm the message landed",
    ours:
      "Synchronous, in-band. After Return, the server re-walks the accessibility tree and looks for an AXGenericElement whose description starts with \"Your message, \" followed by the text you sent. Either the bubble is there or it is not.",
    competitor:
      "Asynchronous via webhook. The send returns an HTTP 200 with a message_id in ~300ms. \"sent\", \"delivered\", \"read\" arrive on your webhook later, as the recipient's device acknowledges.",
  },
  {
    feature: "Sending identity",
    ours:
      "Whatever account is signed in to the WhatsApp desktop app on that Mac. Typically your personal number, used for friends and family.",
    competitor:
      "A registered Business Cloud API number. By policy that number cannot also be signed in to the consumer WhatsApp app.",
  },
  {
    feature: "Where the agent sees the conversation",
    ours:
      "The agent reads the same WhatsApp window a human reads. read_messages returns the rendered chat. The agent and the human share one view of the conversation.",
    competitor:
      "The agent reads whatever your webhook persisted into your database. Human operators read messages in a separate inbox tool (often a BSP console). Two views, kept in sync by your code.",
  },
  {
    feature: "Throughput ceiling per identity",
    ours:
      "About 15 messages per minute on one Mac driving one signed-in account. Bounded by the wall-clock cost of AX traversal + paste + Return + verify per send.",
    competitor:
      "Hundreds of requests per second per phone number at the API layer; rate tiers (1K to unlimited unique daily users) gate sustained throughput.",
  },
  {
    feature: "Time to first message",
    ours:
      "Minutes. npm install -g whatsapp-mcp-macos, grant Accessibility permission to the host app, add a stdio entry to your MCP config, restart your agent.",
    competitor:
      "Days to weeks. Business verification, phone-number registration, first template approval, opt-in collection, webhook stand-up.",
  },
  {
    feature: "Per-message cost (May 2026)",
    ours:
      "Free. Locally executed npm package, MIT licensed.",
    competitor:
      "Per-message pricing since Nov 2025. Marketing templates range from roughly $0.025 (India) to $0.1365 (Germany) per message. Service replies inside the 24-hour window are free.",
  },
];

const agentWorkflowMessages = [
  {
    from: 0,
    to: 1,
    label: "remind me what Sarah and I last talked about",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "whatsapp_search(\"Sarah\")",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "[{index:0, name:\"Sarah Cohen\", section:\"chats\"}, ...]",
    type: "response" as const,
  },
  {
    from: 1,
    to: 2,
    label: "whatsapp_open_chat(0)",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "{ activeChat: \"Sarah Cohen\" }",
    type: "response" as const,
  },
  {
    from: 1,
    to: 2,
    label: "whatsapp_read_messages(limit: 20)",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "[{sender, text, time, isFromMe}, ... x20]",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "summary of the last 20 messages",
    type: "response" as const,
  },
];

const businessApiWorkflowMessages = [
  {
    from: 0,
    to: 1,
    label: "remind me what Sarah and I last talked about",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "GET /contacts?name=Sarah",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "404, no such endpoint exists",
    type: "error" as const,
  },
  {
    from: 1,
    to: 0,
    label: "I can only see users who messaged this business first.",
    type: "error" as const,
  },
];

const readSideOnlyOnMcp = [
  {
    text:
      "Searching your own contact list by display name (the name you saved Sarah as, not her phone number)",
  },
  {
    text:
      "Listing the chats currently in your sidebar, with unread counts and last-message previews",
  },
  {
    text:
      "Reading the visible history of a chat, including messages sent before you wired up any automation",
  },
  {
    text:
      "Triaging by tab: unread, favorites, groups, archived, starred",
  },
  {
    text:
      "Asking the agent \"who haven't I replied to today?\" and getting an answer from the same sidebar a human would scan",
  },
  {
    text:
      "Drafting a reply that references something specific the contact said three messages ago",
  },
];

const honestCloudApiCases = [
  {
    text:
      "You are a verified business sending opted-in transactional messages (OTPs, order confirmations, shipping updates) at fan-out scale",
  },
  {
    text:
      "Your sending identity is organizational and needs to outlive any single person on the team",
  },
  {
    text:
      "You need multi-tenant SaaS shape: per-tenant tokens, audit logs, multi-number under one Business Account",
  },
  {
    text:
      "You need to operate from servers, not from a Mac somebody actually uses",
  },
  {
    text:
      "Your compliance officer needs to see opt-in records, template review history, and message-level audit trail",
  },
];

const faqItems = [
  {
    q: "Why phrase the comparison as \"accessibility vs Business API\" rather than \"desktop app vs Cloud API\"?",
    a: "Because accessibility is the load-bearing part. The reason WhatsApp MCP can expose six read-side tools is the macOS Accessibility framework: it lets the server walk the WhatsApp Catalyst app's AX tree and read the sidebar, chat list, and rendered messages as structured data. Without accessibility you would be stuck with screenshots and OCR. The Business API has no equivalent surface; its API contract is send / receive / manage templates, full stop. So \"desktop vs cloud\" hides the actual mechanism, and the mechanism is what determines what an LLM can do.",
  },
  {
    q: "Can the Business API at least list contacts I know about through Meta's other surfaces?",
    a: "No. There is no contacts directory endpoint on the WhatsApp Cloud API. Your integration only learns about a phone number when that number sends a message to your registered business number (the inbound arrives on your webhook with a contacts[] array carrying name and wa_id). You cannot enumerate users, search by name, or fetch history. This is by design: the Business Cloud API is the business's outbound + inbound surface, not a CRM. If you want a contact directory you assemble one yourself from inbound events.",
  },
  {
    q: "Is the read-side actually useful for an agent, or is it nice-to-have?",
    a: "It is the part that makes agents on personal accounts actually work. A useful WhatsApp agent rarely starts from a fully specified \"send X to Y\". It starts from \"remind me what we talked about\", \"who is waiting on a reply\", \"summarize the unread\", \"find the thread where we agreed on Tuesday\". Each of those is a read-side operation. An agent on the Business API can only do those if you have already taken on the engineering work of mirroring every inbound into your own database, and even then it has no view of messages from before you set that up.",
  },
  {
    q: "Does accessibility-driven automation work on the official Business app (\"WhatsApp Business\" desktop), or only consumer WhatsApp?",
    a: "The current MCP server targets the consumer WhatsApp Catalyst app on macOS. That app's accessibility tree is what the AX traversal code expects. WhatsApp Business is a different binary with a different UI shape. In principle the same accessibility mechanism applies, in practice the selectors and the verification-prefix string (\"Your message, \" on consumer) would need to be relearned. If you are running a small business off a single signed-in Business app account on a Mac, the architecture port is small but not zero. Today the supported path is consumer.",
  },
  {
    q: "Is there a hybrid where the agent uses both, picking per message?",
    a: "Yes, and it is a reasonable shape for products that have both a personal-coordination side and a transactional side. The Cloud API entry handles opted-in outbound from the business number (\"your package shipped\"). The local MCP entry handles personal-account inbound triage and one-to-one reply drafting from your own number. The two paths target distinct sending identities (a Business Cloud API number cannot also be the consumer-app number at the same time), so they do not step on each other. Agent config carries one stdio entry plus one HTTP entry, and the agent picks based on which account should be the sender.",
  },
  {
    q: "What happens if WhatsApp redesigns the sidebar and the accessibility tree shifts?",
    a: "The selectors in the server reference role names (AXTextArea, AXGenericElement) and a small set of verification prefixes (notably \"Your message, \" on outgoing bubbles). A redesign that keeps the same Catalyst roles keeps working unchanged. A redesign that swaps roles or removes the outgoing-bubble prefix would need updates to the traversal code. Catalyst has historically been stable on these specific roles. Compare to the Business API surface, which is contractually stable: Meta versions it (v21.0 today) and breaking changes are documented and dated. Different stability models, both real.",
  },
  {
    q: "How much code is actually involved in the read-side?",
    a: "The interesting part is one repeating shape: locate a window-scoped role in the AX tree, walk children depth-first, filter to elements with the description prefixes WhatsApp uses to mark sidebar rows, search results, message bubbles, and active-chat headings. That logic, plus the per-tool argument plumbing, fits inside Sources/WhatsAppMCP/main.swift. Total file is about 1,200 lines, of which the actual AX traversal is a few hundred. There is no language model in the loop on the server side; the LLM lives in your MCP host, the server is plumbing.",
  },
  {
    q: "Is this against WhatsApp's consumer terms of service?",
    a: "The accessibility framework is a sanctioned surface (VoiceOver uses the same APIs). The official WhatsApp desktop app is the sanctioned client. What gets accounts banned is the kind of activity, not the mechanism. A personal account using accessibility-driven tools to send the messages it would normally send, to people it would normally send them to, is the same as a human using the same app. The same account using any automation, including accessibility-driven automation, to mass-message strangers or behave like a verified business at scale is exactly what consumer-terms enforcement is for, and exactly what the Business API exists to make legitimate. Read the consumer terms at https://www.whatsapp.com/legal/terms-of-service before pushing volume.",
  },
  {
    q: "Why not just scrape WhatsApp Web with Playwright and skip macOS entirely?",
    a: "Two reasons. First, whatsapp-web.com is heavily fingerprinted by Meta because the multi-device protocol and WhatsApp Web traffic are where most automation has historically lived; accounts running headless-browser automation against whatsapp-web.com do get logged out and sometimes banned. Second, contenteditable inputs and focus management in headless browsers are notoriously unreliable for the WhatsApp compose box; you get sent messages that have the wrong characters, or no message at all, on a meaningful fraction of attempts. The accessibility path drives the same chat your hands would, on the same client your account already signs in to, and the traffic on the wire is the official client's normal traffic.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "WhatsApp MCP via accessibility vs the Business API: the agent's tool surface decides",
    description:
      "A side-by-side of what an AI agent can actually do through each integration. WhatsApp MCP exposes eleven named tools, six of which are read-side operations against your existing contacts and chat history (search by name, list visible chats, read message history, get active chat, scroll search results, navigate tabs). The Business Cloud API exposes outbound, inbound webhooks, template management, and media endpoints. It does not expose a contact directory or chat history. That asymmetry is the deciding factor for personal-account agents.",
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

export default function WhatsappMcpVsBusinessApiPage() {
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
            Compared by the agent&apos;s tool surface
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
            WhatsApp MCP via accessibility vs the Business API: the agent&apos;s tool surface decides.
          </h1>
          <p className="text-lg text-zinc-700 leading-relaxed mb-4">
            Most takes on this pair frame it as personal account versus
            verified business, or policy versus convenience. The frame
            that actually decides for an agent is different: what tools
            does the LLM see on each side, and which of them are{" "}
            <span className="font-semibold">read-side</span>?
          </p>
          <p className="text-lg text-zinc-700 leading-relaxed mb-4">
            On the accessibility path the agent sees eleven tools, six of
            them read-side against your existing contacts and chat
            history. On the Business API the agent sees graph endpoints
            for send, receive, and template management, with no read-side
            into your contact directory at all. That gap is what makes
            the two architectures non-substitutable.
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
                Direct answer, verified 2026-05-20
              </p>
              <p className="text-zinc-900 text-lg leading-relaxed mb-3">
                These are not feature-for-feature competitors. They are
                two different things the agent is allowed to do.
              </p>
              <ul className="list-disc pl-5 text-zinc-700 leading-relaxed space-y-2">
                <li>
                  <span className="font-semibold text-zinc-900">
                    WhatsApp MCP via accessibility
                  </span>{" "}
                  exposes eleven tools to the LLM. Six are read-side:{" "}
                  <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-xs">
                    whatsapp_search
                  </code>
                  ,{" "}
                  <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-xs">
                    whatsapp_list_chats
                  </code>
                  ,{" "}
                  <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-xs">
                    whatsapp_read_messages
                  </code>
                  ,{" "}
                  <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-xs">
                    whatsapp_get_active_chat
                  </code>
                  ,{" "}
                  <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-xs">
                    whatsapp_scroll_search
                  </code>
                  ,{" "}
                  <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-xs">
                    whatsapp_navigate
                  </code>
                  . They turn the WhatsApp window into a structured data
                  source the agent can query against your existing
                  personal account.
                </li>
                <li>
                  <span className="font-semibold text-zinc-900">
                    The{" "}
                    <a
                      href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                      className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                    >
                      WhatsApp Cloud Business API
                    </a>
                  </span>{" "}
                  exposes outbound message sends, inbound webhook events,
                  template management, and media endpoints. It has{" "}
                  <span className="font-semibold">no contact-directory access</span>
                  , no chat-history endpoint, and no view of conversations
                  on your personal number. It is the business&apos;s outbound
                  surface to opted-in users.
                </li>
              </ul>
              <p className="text-zinc-700 leading-relaxed mt-4 text-sm">
                Tool registry sourced from{" "}
                <a
                  href="https://github.com/m13v/whatsapp-mcp-macos/blob/main/Sources/WhatsAppMCP/main.swift"
                  className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                >
                  Sources/WhatsAppMCP/main.swift
                </a>{" "}
                (lines 994-1110). API reference sourced from{" "}
                <a
                  href="https://developers.facebook.com/docs/whatsapp/cloud-api/reference"
                  className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                >
                  developers.facebook.com/docs/whatsapp/cloud-api/reference
                </a>
                .
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What the agent actually sees, side by side
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The MCP host hands the LLM a tool list. Whatever is in that
            list is what the LLM can call. Whatever is not in the list
            does not exist as far as the agent is concerned. So the only
            comparison that matters is the two lists.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-6">
            On the left, the eleven tools registered by{" "}
            <code className="bg-zinc-100 text-zinc-900 px-1 py-0.5 rounded text-xs">
              whatsapp-mcp-macos
            </code>
            . On the right, the operations a Cloud-API-wrapping MCP
            server has to choose from when it builds its own tool list.
          </p>

          <AnimatedCodeBlock
            code={mcpToolListCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift (tool registry)"
          />

          <AnimatedCodeBlock
            code={cloudApiSurfaceCode}
            language="http"
            filename="WhatsApp Cloud Business API surface (paraphrased from Meta docs)"
          />

          <p className="text-zinc-700 leading-relaxed mt-6">
            Notice the shape of the asymmetry. The MCP path is a
            <em> chat-shaped surface</em>: search, open, read, scroll,
            navigate, all anchored on the chat. The Business API is a
            <em> messaging-shaped surface</em>: send a message to a
            number, receive a message from a number, manage the
            templates the messages must conform to. There is no chat
            object in the API at all.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The read-side is the load-bearing difference
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Send-side capability is roughly symmetric: both paths can
            put a message in front of a recipient. The asymmetry is what
            the agent can{" "}
            <span className="font-semibold">read</span> before deciding
            what to write. The Cloud Business API does not expose any of
            the following. The MCP accessibility path exposes all of
            them, against the personal account already signed in to the
            Mac.
          </p>

          <AnimatedChecklist
            title="Read-side operations: MCP via accessibility only"
            items={readSideOnlyOnMcp}
          />

          <p className="text-zinc-700 leading-relaxed mt-6">
            These are not edge cases. They are the bulk of what a useful
            personal-account agent does between message sends. An agent
            that cannot do them is not so much an agent as a templated
            SMS gateway.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            One realistic agent prompt, two architectures
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Take a prompt almost every personal-account agent gets at
            least once a day: <em>remind me what Sarah and I last talked
            about</em>. On the MCP path the agent has tools that map
            cleanly to that. On the Business API it stalls at step one.
          </p>

          <SequenceDiagram
            title="MCP via accessibility, fulfilling 'remind me what Sarah and I last talked about'"
            actors={["user", "LLM", "WhatsApp MCP"]}
            messages={agentWorkflowMessages}
          />

          <SequenceDiagram
            title="WhatsApp Cloud Business API, same prompt"
            actors={["user", "LLM", "Cloud API"]}
            messages={businessApiWorkflowMessages}
          />

          <p className="text-zinc-700 leading-relaxed mt-6">
            The second diagram is not a strawman. The Cloud API
            genuinely has no operation that maps to that prompt against
            your personal contacts. To fulfill the prompt under the
            Business API you would need to: register a business number,
            convince Sarah to message it first, persist every inbound
            into your own database from that point onward, then query
            that database. Three of those four steps are not engineering
            problems; they are social ones.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 max-w-3xl mx-auto">
            Operation by operation
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl mx-auto">
            Eleven rows. The first three rows are the ones that make the
            two paths non-substitutable. The remaining rows are where
            the rest of the architecture choice falls out.
          </p>
          <ComparisonTable
            heading="Per-operation comparison"
            intro="Both columns are real, in-production architectures. Picking between them is not about features; it is about whether the agent needs read access to your personal-account graph."
            productName="WhatsApp MCP via accessibility"
            competitorName="WhatsApp Cloud Business API"
            rows={operationRows}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The honest case for the Business API
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            None of the above means the Business API is the wrong tool.
            It is the right tool when the shape of the work is
            fundamentally fan-out from a verified business to opted-in
            users, not personal-account triage. Concretely:
          </p>

          <AnimatedChecklist
            title="The Business API is the answer if"
            items={honestCloudApiCases}
          />

          <p className="text-zinc-700 leading-relaxed mt-6">
            If any one of those is true, the read-side asymmetry above
            does not matter to you. You are not trying to give an agent
            a view of your personal conversation graph; you are trying
            to put structured outbound in front of users who opted in.
            That is exactly what the Cloud API was built for, and
            accessibility-driven automation has no business in that
            shape of work.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The honest case for the MCP accessibility path
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The MCP path wins exactly when the work is the inverse of
            the above: one human (or one agent on behalf of that human)
            doing personal-account-shaped things at sub-15-per-minute
            cadence. Solo founders routing inbound from customers,
            partners, and friends through one number. AI agents
            triaging the inbox overnight and surfacing the three threads
            that need a reply by morning. Long-tail one-to-one
            coordination that should not flow through a verified
            business identity.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            For that shape of work, the read-side tools are the entire
            point. The Business API does not offer them at all, and no
            amount of clever webhook engineering reconstructs them
            faithfully from inbound-only events.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Hybrid is fine and common
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Nothing forces a single architecture per product. A common
            shape is two MCP entries in one agent config: a stdio entry
            pointing at the local accessibility-driven server for
            personal-account work, and an HTTP entry wrapping the Cloud
            API for verified-business outbound. The two paths target
            distinct sending identities (the business number cannot also
            be the consumer-app number at the same time), so they do
            not step on each other. The agent picks based on which
            account should send.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            See the{" "}
            <a
              href="https://github.com/m13v/whatsapp-mcp-macos"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              whatsapp-mcp-macos
            </a>{" "}
            README for the stdio entry. See{" "}
            <a
              href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              Meta&apos;s Cloud API getting-started guide
            </a>{" "}
            for the verified-business onboarding side.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Not sure which side of the read/write line your agent needs?"
          description="If your use case sits between personal-account triage and verified-business fan-out, 30 minutes is usually enough to map it to the right path. Bring the prompt the agent will see."
        />

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <FaqSection items={faqItems} />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Map your agent's tool surface to the right WhatsApp path in 30 min."
        />
      </article>
    </>
  );
}
