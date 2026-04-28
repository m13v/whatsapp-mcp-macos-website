import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  BackgroundGrid,
  GradientText,
  AnimatedCodeBlock,
  ComparisonTable,
  SequenceDiagram,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://whatsapp-mcp-macos.com/t/box-mcp-server";
const PUBLISHED = "2026-04-28";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title: "Box MCP server, and the MCP servers that have to drive a desktop app instead",
  description:
    "Box MCP server is the canonical example of an MCP server that wraps a vendor's REST API. The pattern works because Box has a clean public API, OAuth, and a per-object permission model. When a vendor lacks any of those, you end up writing a different kind of MCP server. Here is the contrast, with code from both sides.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Box MCP server is the textbook REST-passthrough MCP. WhatsApp MCP is the foil.",
    description:
      "Box ships an MCP server because Box has a clean REST API and OAuth tenant model. WhatsApp on macOS does not, so the MCP for it drives the running desktop app via accessibility APIs and reads the chat bubble back to confirm delivery. Two architectures, side by side.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Box MCP server vs the MCP servers that have to drive a desktop app",
    description:
      "Box MCP wraps a public REST API. WhatsApp MCP walks an AX tree and reads the chat bubble. The two architectures look almost nothing alike, and which one you write depends entirely on the vendor.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Box MCP server" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "Box MCP server", url: PAGE_URL },
];

const verificationCode = `// Sources/WhatsAppMCP/main.swift, line 920 onward.
// This is the entire delivery confirmation path.
// There is no HTTP call, no webhook, no API receipt.

pressReturn()
Thread.sleep(forTimeInterval: 1.0)

// Re-walk the WhatsApp AX tree after the send.
let postElements = traverseAXTree(pid: pid)
let genericElements = findElements(in: postElements,
                                   role: "AXGenericElement")

var lastSentMessage: String? = nil
for el in genericElements {
    let desc = cleanUnicode(el.description ?? "")
    if desc.hasPrefix("Your message, ") {
        // Strip the trailing ", 4:21 PM" timestamp.
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
// The chat is the receipt.`;

const boxToolCode = `# mcp-server-box exposes 11+ tool categories.
# Each one is a thin wrapper over a Box REST endpoint.

box_tools_files       # /2.0/files/{id}, /content
box_tools_folders     # /2.0/folders/{id}/items
box_tools_search      # /2.0/search?query=...
box_tools_metadata    # /2.0/metadata_templates/...
box_tools_collaboration  # /2.0/collaborations
box_tools_shared_links   # /2.0/shared_items
box_tools_tasks       # /2.0/tasks, /2.0/task_assignments
box_tools_users       # /2.0/users
box_tools_groups      # /2.0/groups
box_tools_ai          # /2.0/ai/ask, /2.0/ai/text_gen
box_tools_docgen      # /2.0/document_generation_jobs
box_tools_web_link    # /2.0/web_links
box_tools_generic     # arbitrary signed Box requests

# Auth: OAuth 2.0, JWT app, or Client Credentials Grant.
# Transport: stdio, SSE, or HTTP.
# Permissions: enforced server-side by Box, per object, per user.`;

const compareRows = [
  {
    feature: "Where the work happens",
    competitor: "Server makes signed HTTPS calls to api.box.com.",
    ours: "Server walks the AXUIElement tree of the running WhatsApp app.",
  },
  {
    feature: "Authentication",
    competitor: "OAuth 2.0, JWT, or CCG. Tokens scoped per user, per app.",
    ours: "macOS Accessibility permission for the parent terminal. No tokens, no tenant.",
  },
  {
    feature: "Surface area the vendor exposes",
    competitor: "A documented public REST API with stable resource models.",
    ours: "An accessibility tree shaped for a screen reader, not for automation.",
  },
  {
    feature: "Permission model",
    competitor: "Per-file, per-folder, enforced by Box. Same as a logged-in user.",
    ours: "Whatever the human sees in their own WhatsApp window.",
  },
  {
    feature: "Where the server can run",
    competitor: "Anywhere with internet. Box hosts a remote variant too.",
    ours: "On the same Mac as the WhatsApp Catalyst app. Local stdio only.",
  },
  {
    feature: "Delivery confirmation for a write",
    competitor: "HTTP 2xx from api.box.com, plus the resource id in the response body.",
    ours: "AXGenericElement whose description starts with 'Your message, ' and matches the text just typed.",
  },
  {
    feature: "Failure mode the agent has to handle",
    competitor: "401 (token expired), 403 (insufficient scope), 429 (rate limit).",
    ours: "Compose field not found, paste failed, bubble not visible after 1.0s.",
  },
  {
    feature: "Cost",
    competitor: "Box subscription seat, plus whatever your AI agent burns.",
    ours: "Free. The MCP package is npm-installable, MIT-licensed, runs locally.",
  },
];

const sequenceActorsBox = ["Agent", "MCP", "Box API"];
const sequenceMessagesBox = [
  { from: 0, to: 1, label: "tools/call box_tools_search", type: "request" as const },
  { from: 1, to: 2, label: "GET /2.0/search?query=...", type: "request" as const },
  { from: 2, to: 1, label: "200 OK + JSON", type: "response" as const },
  { from: 1, to: 0, label: "tool result", type: "response" as const },
];

const sequenceActorsWa = ["Agent", "MCP", "WhatsApp app"];
const sequenceMessagesWa = [
  { from: 0, to: 1, label: "tools/call whatsapp_send_message", type: "request" as const },
  { from: 1, to: 2, label: "click compose, paste, return", type: "request" as const },
  { from: 1, to: 2, label: "re-walk AX tree (1.0s later)", type: "event" as const },
  { from: 2, to: 1, label: "AXGenericElement: 'Your message, hi'", type: "response" as const },
  { from: 1, to: 0, label: "verified: true", type: "response" as const },
];

const faqItems = [
  {
    q: "What does Box MCP server actually do under the hood?",
    a: "It is a stdio (or SSE, or HTTP) MCP server written in Python that exposes Box REST API endpoints as MCP tools. The repository at github.com/box-community/mcp-server-box ships eleven-plus tool categories: box_tools_files, box_tools_folders, box_tools_search, box_tools_metadata, box_tools_collaboration, box_tools_shared_links, box_tools_tasks, box_tools_users, box_tools_groups, box_tools_ai, box_tools_docgen, box_tools_web_link, and box_tools_generic. Each maps to one or more endpoints under api.box.com. Authentication uses OAuth 2.0, JWT, or Client Credentials Grant. Box also runs a hosted version of the same surface that an AI host can connect to over HTTP without the customer running anything locally. So functionally, Box MCP is a typed, MCP-shaped facade in front of the same API a Box integration partner would have used a year ago.",
  },
  {
    q: "Is Box MCP server the only way to connect AI to Box?",
    a: "No. The Box REST API has been around for years and most Box integrations still use it directly. The MCP layer is additive. It standardizes the tool descriptions, parameter schemas, and authentication handshake so that any MCP-aware client (Claude, Cursor, Copilot Studio, Mistral Le Chat, and other listed hosts) can pick up the same surface without bespoke glue. If you already have a Box SDK integration and an in-house agent runtime, MCP buys you portability across hosts more than it buys you new capability.",
  },
  {
    q: "Why does this page talk about WhatsApp MCP next to Box MCP?",
    a: "Because Box MCP is one specific design and there is a different design that is not always obvious. Box ships an MCP server because three preconditions hold: a clean public REST API, an OAuth tenant model, and a per-resource permission system the vendor enforces. The whole MCP layer sits on top of those three things. WhatsApp on macOS does not have that combination for individual users (the Business API exists but is the wrong shape for personal accounts and one-off agents), so the MCP server for it cannot be a REST passthrough. It has to drive the running WhatsApp Catalyst app through macOS accessibility APIs and verify writes by reading the rendered chat. That contrast is the most useful frame I know for thinking about MCP server architecture, and it is missing from every page about Box MCP I could find.",
  },
  {
    q: "What are the three preconditions you keep mentioning?",
    a: "First, a public, documented REST or RPC API the server can call from a process the user controls. Second, a way for the AI host to obtain a credential that scopes its access to one user or one tenant (OAuth, JWT, service account). Third, a permission model the vendor enforces on each request, so that the agent cannot accidentally read or write data outside the user's own grants. Box has all three, cleanly. Stripe, GitHub, Slack, Notion, Linear all have all three. WhatsApp consumer accounts have none of those in a form an agent or a solo developer can use. SMS providers have a partial form (an HTTP API with auth) but not the third (the permission model is 'whatever your account can pay for'). When all three hold, you get an MCP server shaped like Box's. When one of them is missing, you get an MCP server shaped like WhatsApp MCP for macOS.",
  },
  {
    q: "How does WhatsApp MCP actually verify that a message was sent?",
    a: "It does not call any Meta endpoint. After the send, it sleeps 1.0 second and then re-traverses the WhatsApp app's accessibility tree (Sources/WhatsAppMCP/main.swift, line 920 onward). It collects every AXGenericElement, looks for one whose description starts with the literal prefix 'Your message, ', strips the trailing timestamp suffix with a regex, and compares the remaining text against what the agent asked to send. If the text matches, the JSON-RPC response carries verified:true. If the prefix is found but the text does not match, the response carries verified:false plus the bubble it could see in a warning field. If no matching bubble is found at all, the same false result returns with a different warning. Box's equivalent of this code is checking that api.box.com returned a 2xx and a resource id.",
  },
  {
    q: "Could WhatsApp MCP be rewritten as a REST passthrough like Box's?",
    a: "Only if the agent's owner already has a WhatsApp Business Cloud API integration with Meta. That path requires a verified business, an opted-in template list, a phone number that is not your personal one, and a webhook endpoint to receive deliveries. It is the right tool for an e-commerce shop sending shipping notifications to a hundred thousand opted-in customers. It is the wrong tool for a solo founder routing inbound chat through their own WhatsApp number, or for an agent that needs to read a group chat the operator is in. The accessibility-driven MCP exists because the Business API does not cover those cases. So in principle yes, in practice the populations of users for whom that rewrite makes sense and the populations of users who actually want this MCP server barely overlap.",
  },
  {
    q: "Does the hosted Box MCP server need anything to be installed locally?",
    a: "No, that is the whole point of the hosted variant. The AI host (Claude, Copilot Studio, etc.) connects directly to Box's hosted endpoint over HTTP, the user authenticates through OAuth in the host's normal flow, and tool calls travel from the host to box.com without any local server. The self-hosted Python project on GitHub matters when you want to run inside Cursor, customize the tool surface, or operate inside a network where outbound traffic to box.com from the AI host is not allowed. WhatsApp MCP has no hosted equivalent. The desktop app it drives only exists on the user's Mac, so the MCP child has to run there too.",
  },
  {
    q: "Is the Box MCP server permission model strictly safer than the WhatsApp MCP one?",
    a: "Strictly more granular, yes. Box enforces permissions per file, per folder, per shared link, against the OAuth-issued user identity. The MCP server cannot read what the user could not read in the Box web app. WhatsApp MCP runs as the macOS Accessibility-permitted parent process, so its grant is 'everything the user can see in WhatsApp on this Mac.' That is a coarser slice. It is the right slice for an automation that lives entirely on the operator's own machine and acts as them. It is the wrong slice for multi-tenant SaaS access. So the comparison is not safer-vs-unsafer, it is per-resource-vs-per-machine. Pick the one that matches who actually runs the agent.",
  },
  {
    q: "Can I run Box MCP server and WhatsApp MCP in the same host config?",
    a: "Yes, MCP hosts are designed for that. The host (Claude Code, Cursor, Claude Desktop) reads a JSON config that names servers and how to launch each one. Box's remote variant is an HTTP entry with OAuth, the self-hosted Box variant is a stdio entry that runs the Python server, and the WhatsApp MCP is another stdio entry that runs whatsapp-mcp. The host forks the stdio children, opens HTTP connections to the remote ones, and presents the union of all tool surfaces to the agent. From the agent's perspective there is no boundary: a single tools/list call returns box_tools_search, whatsapp_search, and everything else in one flat namespace. A workflow that pulls a contract out of Box, summarizes it, and pings the customer on WhatsApp is just three tool calls in the same turn.",
  },
  {
    q: "What MCP servers should I expect to look like Box's, and which should I expect to look like WhatsApp MCP?",
    a: "If the underlying product is a SaaS with a public REST API, OAuth, and per-object permissions (Box, Stripe, Linear, Notion, Slack, GitHub, Salesforce, Box, Atlassian, HubSpot), expect the MCP server to be a thin REST passthrough. Often the vendor will ship it themselves. If the underlying product is a desktop app, a consumer messaging surface, or a system whose API is hostile to single-user agents (WhatsApp consumer, iMessage, Apple Notes, native macOS apps in general), expect the MCP server to drive a running app instance via accessibility APIs and verify writes by re-reading the UI. Often the vendor will not ship one and you will have to build it. The architectures are not interchangeable. Trying to write a REST passthrough where you need accessibility, or vice versa, is the most common way to get stuck.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "Box MCP server, and the MCP servers that have to drive a desktop app instead",
    description:
      "Box MCP server is the textbook example of an MCP server that wraps a vendor's REST API behind OAuth and a per-object permission model. The architecture only works because Box ships all three. WhatsApp on macOS does not, so the MCP server for it drives the running Catalyst app via accessibility APIs and reads the rendered chat bubble back as the only delivery confirmation. This page walks through the contrast, with code from both sides and a per-feature table.",
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

export default function BoxMcpServerPage() {
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
              Two MCP servers, two architectures
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              Box MCP server is a thin facade over a clean REST API.{" "}
              <GradientText>
                That pattern only works because Box ships three things almost no
                other vendor ships at once.
              </GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-6 max-w-2xl">
              I read Box&apos;s MCP server code, then I read the MCP I wrote for
              WhatsApp on macOS, and the two pieces of software barely look
              like the same thing. Box&apos;s server is a Python project that
              calls{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                api.box.com
              </code>{" "}
              over HTTPS with an OAuth token. WhatsApp MCP is a Swift binary
              that walks the accessibility tree of a running Catalyst app and
              reads the chat bubble back to confirm a send.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              They are both real MCP servers. They both fit in the same{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                mcpServers
              </code>{" "}
              JSON block. But the design moves they make are almost completely
              disjoint, and which one you end up writing depends on whether
              the vendor on the other side gives you a public REST API, an
              OAuth tenant model, and a per-object permission system. Box does.
              Most apps do not.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#two-architectures"
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                See the two architectures
              </a>
              <a
                href="https://github.com/box-community/mcp-server-box"
                className="text-sm font-medium text-teal-700 hover:text-teal-600"
              >
                Box MCP source &rarr;
              </a>
              <a
                href="https://github.com/m13v/whatsapp-mcp-macos"
                className="text-sm font-medium text-teal-700 hover:text-teal-600"
              >
                WhatsApp MCP source &rarr;
              </a>
            </div>
          </div>
        </BackgroundGrid>

        <div className="mt-10 max-w-4xl mx-auto px-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <div className="mt-4 mb-8 max-w-4xl mx-auto px-6">
          <ArticleMeta
            datePublished={PUBLISHED}
            readingTime="9 min read"
            author="Matthew Diakonov"
            authorRole="Written with AI"
          />
        </div>

        <section className="max-w-3xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What Box MCP server actually is
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The repository at{" "}
            <a
              href="https://github.com/box-community/mcp-server-box"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              github.com/box-community/mcp-server-box
            </a>{" "}
            is a Python project. It runs locally (or as a hosted service Box
            operates on{" "}
            <a
              href="https://www.box.com/mcp-server"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              box.com/mcp-server
            </a>
            ), and it speaks MCP over stdio, SSE, or HTTP. Inside, every tool
            it exposes is a small wrapper around a Box REST endpoint. There is
            no business logic of its own. The MCP server is a typed,
            JSON-RPC-shaped projection of the same{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              api.box.com
            </code>{" "}
            surface a Box partner integration would already be using.
          </p>
          <AnimatedCodeBlock
            code={boxToolCode}
            language="python"
            filename="mcp-server-box / tool surface"
          />
          <p className="text-zinc-700 leading-relaxed mt-6">
            That shape is exactly what most readers expect when they hear
            &quot;MCP server.&quot; Tools as named functions. Each tool maps
            to one HTTP call. Auth is whatever the vendor uses (OAuth here, but
            JWT and CCG also accepted). The host gets a clean tools/list, the
            agent picks one, the server makes the call, the response comes
            back. Done.
          </p>
        </section>

        <section
          id="two-architectures"
          className="max-w-4xl mx-auto px-6 my-20"
        >
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The shape of an MCP request, on both sides
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Same JSON-RPC framing on the wire. Almost nothing else in common.
          </p>
          <SequenceDiagram
            title="Box MCP — REST passthrough"
            actors={sequenceActorsBox}
            messages={sequenceMessagesBox}
          />
          <SequenceDiagram
            title="WhatsApp MCP — accessibility-driven"
            actors={sequenceActorsWa}
            messages={sequenceMessagesWa}
          />
          <p className="text-zinc-700 leading-relaxed mt-6">
            On the top, the MCP child is doing what reads as classic
            integration work: take a tool call, translate it to an HTTP
            request, parse the JSON, return the relevant fields. On the bottom,
            the MCP child is doing what reads as test automation work: click,
            paste, press a key, sleep, re-read the UI, and decide whether the
            UI now contains evidence that the action took. The second pattern
            exists because some vendors do not give you the option of the
            first.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The three preconditions Box MCP relies on
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The Box pattern is a function of three properties Box happens to
            ship together. None of them are exotic, but the conjunction of all
            three is rarer than it looks. Drop any one and the whole shape
            stops working.
          </p>
          <ol className="space-y-5 text-zinc-700 leading-relaxed">
            <li>
              <strong className="text-zinc-900">
                A public, documented HTTP API.
              </strong>{" "}
              The MCP server has to be able to call something from a process
              the user controls. Box has{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                api.box.com
              </code>
              , and the resource model has been stable for years. Without
              this, the MCP server has nothing to wrap.
            </li>
            <li>
              <strong className="text-zinc-900">
                A tenant-scoped credential the host can obtain.
              </strong>{" "}
              OAuth 2.0 here, with JWT and Client Credentials Grant available
              for service-account flows. The host (Claude, Cursor, Copilot
              Studio) walks the user through a sign-in once, gets a token, and
              from then on every tool call is gated by that token. Without
              this, you cannot let one MCP server be used by many people.
            </li>
            <li>
              <strong className="text-zinc-900">
                A vendor-enforced permission model that runs on every request.
              </strong>{" "}
              The MCP server can ask Box for a file id, but Box returns 403 if
              the OAuth user does not have access. The agent cannot accidentally
              read someone else&apos;s data because the wire protocol itself
              checks. Without this, &quot;the AI agent has Box access&quot;
              becomes &quot;the AI agent has all of Box&quot;, which is not a
              shippable product.
            </li>
          </ol>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What you do when one of those is missing
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Take WhatsApp on macOS as a worked example. The vendor (Meta) does
            ship a public HTTP API, the WhatsApp Business Cloud API. So the
            first precondition technically holds. But the Business API is
            scoped to verified businesses, opted-in template lists, and phone
            numbers that are explicitly registered for that program. It does
            not cover the case of a single user routing inbound chat through
            their personal number, or an agent reading the operator&apos;s
            existing groups, or a small team whose customers all message a
            normal, non-Business WhatsApp account. For those cases, a Box-shaped
            MCP server is not buildable, because the vendor&apos;s API was not
            built for those cases at all.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            What you can do is give the agent the same level of access the
            human user already has, by driving the desktop app the human is
            already signed into. macOS exposes every UI element of every
            running app through the accessibility framework as an{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              AXUIElement
            </code>{" "}
            tree. With the right permission grant, a process can read that
            tree, click elements by coordinate, paste into text areas, press
            keys, and re-read the tree afterwards to see what happened.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            That is what the Swift binary at{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              Sources/WhatsAppMCP/main.swift
            </code>{" "}
            does. It imports{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              ApplicationServices
            </code>{" "}
            and{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              AppKit
            </code>
            , finds the running process for bundle id{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              net.whatsapp.WhatsApp
            </code>
            , walks its AX tree, and exposes eleven MCP tools on top:{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_status
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_search
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_open_chat
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_get_active_chat
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_send_message
            </code>
            , and the rest. Same MCP wire format Box uses. Different mechanism
            entirely on the other side of the JSON-RPC boundary.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The receipt is the chat itself
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Here is the part that is hard to picture from a feature list. When
            Box MCP&apos;s file-upload tool succeeds, the proof is a 2xx and a
            file id. When WhatsApp MCP&apos;s send-message tool succeeds, there
            is no API to ask. The only place that knows whether the message
            arrived is the chat. So the server reads the chat back.
          </p>
          <AnimatedCodeBlock
            code={verificationCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
          <p className="text-zinc-700 leading-relaxed mt-6">
            The relevant block runs from line 920 of{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              main.swift
            </code>
            . It presses Return on the compose field, sleeps one second, walks
            the AX tree again, collects every element with role{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              AXGenericElement
            </code>
            , and looks for one whose accessibility description begins with the
            literal prefix{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              Your message,{" "}
            </code>
            . If it finds one and the trailing text matches what the agent
            asked to send, the JSON-RPC response sets{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              verified: true
            </code>
            . If the prefix is found but the text does not match, it sets{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              verified: false
            </code>{" "}
            and includes the visible bubble in a warning field, so the agent
            knows what it is actually looking at.
          </p>
          <p className="text-zinc-700 leading-relaxed mt-4">
            That is the entire delivery confirmation. No webhook. No Meta
            endpoint. No DLR. The chat is the receipt. It is genuinely strange
            to read code that uses an OS accessibility API as the source of
            truth for whether a network operation succeeded, but if you accept
            that the network operation in question is &quot;a desktop app sent
            something to its own backend on the user&apos;s behalf,&quot; the
            UI really is the most honest place to check.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-20">
          <ComparisonTable
            heading="Box MCP server vs WhatsApp MCP for macOS"
            intro="Same MCP framing, almost nothing else in common. Pick the architecture that matches the vendor on the other side."
            productName="WhatsApp MCP"
            competitorName="Box MCP"
            rows={compareRows}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 my-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Which one should you write?
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            If the system you want the agent to reach is a SaaS with a public
            REST or RPC API, OAuth, and per-object permissions, you should
            write something shaped like Box MCP. Often the vendor will already
            have shipped one and you can just install it. The list of vendors
            for whom this is true is long: Box, Stripe, Linear, Notion, Slack,
            GitHub, Salesforce, Atlassian, HubSpot, Cloudflare, AWS, GCP. The
            MCP layer there is genuinely thin.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            If the system is a desktop app whose API is absent or hostile to
            single-user use, you should write something shaped like WhatsApp
            MCP for macOS. AX-tree walking, click by coordinate, paste through
            the clipboard, verify by re-reading the UI. The list of systems
            for which this is the right answer is also long: WhatsApp consumer
            accounts, iMessage, Apple Notes, Calendar.app, Music.app, most
            Catalyst apps, plus a long tail of Mac-only desktop tools. The MCP
            layer here is much thicker, because half of what looks like the
            vendor&apos;s API is missing and the MCP has to fill it.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            The mistake is trying to write one when you needed the other.
            Trying to wrap a non-existent REST API in a Box-shaped MCP gets
            you stuck on auth. Trying to drive a Catalyst app in code when the
            vendor would have given you OAuth is a waste of accessibility
            permissions and a much larger maintenance surface. The first
            decision in an MCP project is which side of this line you are on.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Both can run in the same host
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Worth saying explicitly: an MCP host does not care which side of
            this line a given server lives on. The host reads a JSON config,
            forks the stdio children, and opens HTTP connections to the remote
            ones. The agent sees one flat list of tools. So a workflow that
            looks like &quot;pull the contract out of Box, summarize it, send
            the summary to the customer on WhatsApp&quot; is just three tool
            calls in the same agent turn:{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              box_tools_files
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_search
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_send_message
            </code>
            . Two of those three travel over HTTPS to box.com. One of them
            travels over a Unix domain socket to a Swift process that walks an
            accessibility tree on the same Mac. The agent does not know.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Picking which MCP shape to build?"
          description="If you are deciding between a REST passthrough and an accessibility-driven MCP for an app, I have probably read the relevant code on both sides. Book a 30-minute call."
        />

        <section className="max-w-3xl mx-auto px-6 my-16">
          <FaqSection items={faqItems} />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Talk through your MCP server architecture in 30 min."
        />
      </article>
    </>
  );
}
