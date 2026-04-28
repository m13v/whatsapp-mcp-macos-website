import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  BackgroundGrid,
  GradientText,
  ShimmerButton,
  AnimatedBeam,
  AnimatedCodeBlock,
  StepTimeline,
  GlowCard,
  ComparisonTable,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://whatsapp-mcp-macos.com/t/google-mcp-server";
const PUBLISHED = "2026-04-27";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "Google MCP servers: 35+ tools, exactly one outbound channel to a human",
  description:
    "Google ships official MCP servers for BigQuery, Compute Engine, GKE, Workspace, Maps, and more. Of that catalog, only Gmail can address a person who is not on a Google domain, and even Chat MCP is read-only. This is the missing-channel map and the WhatsApp MCP fix.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Every Google MCP server, graded by whether it can reach a non-Google human",
    description:
      "I read every page in Google's MCP catalog. The numbers are surprising. Chat MCP ships two read-only tools. Gmail MCP can draft but never autonomously send. Here is the catalog table and the WhatsApp MCP shape that closes the gap.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Google's official MCP catalog has zero auto-send tools to non-Google users",
    description:
      "BigQuery, GKE, Workspace, Maps, all in. Outbound to a person on WhatsApp, Telegram, SMS, iMessage: zero. The full catalog, scored, plus the macOS-driven fix.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Google MCP servers" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "Google MCP servers", url: PAGE_URL },
];

type CatalogRow = {
  server: string;
  family: string;
  tools: string;
  outboundToHuman: "none" | "draft-only" | "internal-only" | "yes";
  note: string;
};

const catalog: CatalogRow[] = [
  {
    server: "BigQuery",
    family: "Data & Analytics",
    tools: "schema, query, jobs",
    outboundToHuman: "none",
    note: "Reads/writes warehouse rows. Cannot put text in front of a person.",
  },
  {
    server: "Bigtable",
    family: "Databases (NoSQL)",
    tools: "table CRUD",
    outboundToHuman: "none",
    note: "Same shape as BigQuery; data only.",
  },
  {
    server: "AlloyDB / Cloud SQL / Spanner",
    family: "Databases (SQL)",
    tools: "schema, exec, plan",
    outboundToHuman: "none",
    note: "SQL surface. The agent may write a row, no human is notified.",
  },
  {
    server: "Firestore",
    family: "Databases (NoSQL)",
    tools: "doc, collection, query",
    outboundToHuman: "none",
    note: "Document store. Push notifications are a separate Firebase service, not exposed here.",
  },
  {
    server: "Compute Engine (GCE)",
    family: "Infra & Compute",
    tools: "instance, disk, network ops",
    outboundToHuman: "none",
    note: "Provisioning. No notification primitive.",
  },
  {
    server: "GKE",
    family: "Infra & Compute",
    tools: "cluster, workload, node ops",
    outboundToHuman: "none",
    note: "Kubernetes API surface. Same as GCE.",
  },
  {
    server: "Cloud Run",
    family: "Infra & Compute",
    tools: "service, revision, traffic",
    outboundToHuman: "none",
    note: "Container deploys. No outbound channel.",
  },
  {
    server: "Cloud Storage",
    family: "Infra & Compute",
    tools: "bucket, object",
    outboundToHuman: "none",
    note: "Blob ops only.",
  },
  {
    server: "Pub/Sub",
    family: "Messaging (machine)",
    tools: "topic, subscription, publish",
    outboundToHuman: "none",
    note: 'Machine-to-machine queue. "Messaging" here means service to service, not person to person.',
  },
  {
    server: "Cloud Logging / Monitoring / Trace",
    family: "Observability",
    tools: "log, metric, trace ops",
    outboundToHuman: "none",
    note: "Read-only debugging surfaces.",
  },
  {
    server: "Google Maps Tools",
    family: "Geo",
    tools: "places, routes, geocode",
    outboundToHuman: "none",
    note: "Read-only geo data.",
  },
  {
    server: "Workspace: Drive",
    family: "Workspace",
    tools: "7 (file CRUD, search, perms)",
    outboundToHuman: "none",
    note: "Shares can grant access, but the recipient gets a Google notification, not an outbound message you control.",
  },
  {
    server: "Workspace: Calendar",
    family: "Workspace",
    tools: "8 (event CRUD, suggest, respond)",
    outboundToHuman: "internal-only",
    note: "Invites land in a Google calendar. Non-Google guests get an email, but only if Google decides to send one.",
  },
  {
    server: "Workspace: People API",
    family: "Workspace",
    tools: "3 (profile, search)",
    outboundToHuman: "none",
    note: "Read-only contact lookup.",
  },
  {
    server: "Workspace: Chat",
    family: "Workspace",
    tools: "2 (search_conversations, list_messages)",
    outboundToHuman: "none",
    note: "Both tools are read-only. There is no send_message in the published Chat MCP surface.",
  },
  {
    server: "Workspace: Gmail",
    family: "Workspace",
    tools: "10 (drafts, labels, threads, search)",
    outboundToHuman: "draft-only",
    note: "Has create_draft. Has no autonomous send_message in the official MCP. The published tool list is enumerable on the Workspace MCP docs.",
  },
];

const mergedConfigCode = `{
  "mcpServers": {
    "gmail": {
      "type": "http",
      "url": "https://gmail.googleapis.com/mcp",
      "auth": { "type": "oauth", "scopes": ["gmail.modify"] }
    },
    "calendar": {
      "type": "http",
      "url": "https://calendar.googleapis.com/mcp",
      "auth": { "type": "oauth", "scopes": ["calendar.events"] }
    },
    "whatsapp": {
      "type": "stdio",
      "command": "whatsapp-mcp",
      "args": [],
      "env": {}
    }
  }
}`;

const verificationCode = `// Sources/WhatsAppMCP/main.swift, line 920 onward
pressReturn()
Thread.sleep(forTimeInterval: 1.0)

// Post-send verification: re-walk the AX tree and look for our bubble.
let postElements = traverseAXTree(pid: pid)
let genericElements = findElements(in: postElements, role: "AXGenericElement")

var lastSentMessage: String? = nil
for el in genericElements {
    let desc = cleanUnicode(el.description ?? "")
    if desc.hasPrefix("Your message, ") {           // line 930
        let rest = String(desc.dropFirst("Your message, ".count))
        var text = rest
        if let timeRange = text.range(of: #",\\s+\\d{1,2}:\\d{2}\\s*[APap][Mm]"#,
                                      options: .regularExpression) {
            text = String(text[text.startIndex..<timeRange.lowerBound])
        }
        lastSentMessage = text.trimmingCharacters(in: CharacterSet(charactersIn: ", "))
    }
}
// verified = lastSentMessage matches what we asked to send.
// No webhook. No Google API. The chat bubble is the receipt.`;

const walkthroughSteps = [
  {
    title: "1. Workspace MCP gathers context",
    description:
      "The agent uses Gmail MCP (search_threads, get_thread) and Calendar MCP (list_events) to assemble what it knows about the customer. Both surfaces are read-rich: Gmail ships search and listing, Calendar ships event detail and suggested times. This part of the loop is what Google's MCP catalog does best.",
  },
  {
    title: "2. Workspace MCP runs out of outbound surface",
    description:
      "Gmail MCP can draft, not send. Calendar MCP can create an event, but the recipient sees a Google calendar invite, not a message in their thread. Chat MCP only reads. If the customer is not in a Google org and is not living in their inbox, the Workspace tools cannot deliver anything to them.",
  },
  {
    title: "3. WhatsApp MCP picks up delivery",
    description:
      "The same host config wires a third stdio child: whatsapp-mcp. The agent calls whatsapp_search with the contact name, gets back an indexed list of matching chats, and picks the index it wants. Same JSON-RPC shape as every other MCP child.",
  },
  {
    title: "4. The send is verified against the chat itself",
    description:
      "whatsapp_send_message pastes the message into the compose field via Cmd+V, presses Return, sleeps 1.0 second, and re-walks the WhatsApp accessibility tree. It looks for an AXGenericElement whose description begins with the literal prefix 'Your message, ' and matches the text it just typed. Found means verified:true. Not found means verified:false plus the last bubble it could see.",
  },
  {
    title: "5. The agent reads back the loop",
    description:
      "If you also wired Gmail MCP, the agent can write the result back into the original email thread with create_draft, leaving a paper trail of which channel the customer was actually reached on. The Google half owns the audit log, the WhatsApp half owns the delivery.",
  },
];

const compareRows = [
  {
    feature: "Tools that originate a message to a non-Google user",
    competitor: "0 in the official Workspace MCP catalog",
    ours: "1 (whatsapp_send_message), with delivery verification",
  },
  {
    feature: "Authentication shape",
    competitor: "OAuth 2.0 against googleapis.com, scope-gated per service",
    ours: "Local stdio child, no auth, gated by macOS Accessibility permission",
  },
  {
    feature: "Where the agent runs",
    competitor: "Anywhere with internet (HTTP transport)",
    ours: "On the same Mac as the WhatsApp app (Catalyst, App Store install)",
  },
  {
    feature: "Reach in markets where most chat happens off-email",
    competitor: "Only the customer's email address. WhatsApp, SMS, iMessage all unreachable.",
    ours: "Real WhatsApp inbox, the same number the customer already messages on",
  },
  {
    feature: "Cost per outbound message",
    competitor: "Free for Gmail (rate-limited), but only reaches email-active users",
    ours: "Free, sends through your existing personal or business WhatsApp account",
  },
  {
    feature: "Delivery confirmation",
    competitor: "Gmail's API returns 200 on accepted-for-delivery, no read state",
    ours: "AX-tree re-read returns verified:true when the bubble is visible in the chat",
  },
];

const faqItems = [
  {
    q: "Does Google ship an official MCP server that can send a message to anyone, anywhere?",
    a: "Not for arbitrary recipients. The official catalog covers BigQuery, Cloud SQL, AlloyDB, Spanner, Firestore, Bigtable, GCE, GKE, Cloud Run, Cloud Storage, Pub/Sub, Logging, Monitoring, Maps, and Workspace (Drive, Calendar, Chat, People, Gmail). The only servers in that list whose surface includes a tool that puts text in front of a person are Gmail (create_draft, plus label/thread management) and Calendar (create_event, which can email a non-Google guest as a side effect). There is no SMS MCP, no Voice MCP, no consumer-messenger MCP. If your customer is on WhatsApp and not actively reading email, no published Google MCP server can deliver to them.",
  },
  {
    q: "Is Google Chat MCP really read-only?",
    a: "Per the published Workspace MCP configuration page (developers.google.com/workspace/guides/configure-mcp-servers), Chat ships exactly two tools: search_conversations and list_messages. There is no create_message, no post_to_space, no send. The Chat REST API supports those operations, but they are not yet exposed through the MCP layer. So an agent that wants to post into a Google Chat space has to use the REST API directly with a service account; it cannot do it through the published Chat MCP.",
  },
  {
    q: "Why is Gmail MCP create_draft not a real outbound channel?",
    a: "Two reasons. First, create_draft saves a message to the user's drafts folder; it does not send. The user (or another tool) still has to issue the send. The MCP surface as published does not include send_message, only the draft create plus label/search/thread plumbing. Second, Gmail is not where most of the customer base for a Brazilian gym, an Indian tutor, or an Egyptian e-commerce shop actually reads anything. Even if the agent could send autonomously, the recipient would not see the email for hours or days. The empty cell on the catalog table is real.",
  },
  {
    q: "How does WhatsApp MCP for macOS fit alongside the Google MCP servers?",
    a: "Identically to any other MCP child. The host (Claude Code, Cursor, Claude Desktop) reads a config that names servers and how to launch them; remote Google servers are HTTP entries with OAuth, the local WhatsApp server is a stdio entry that runs the whatsapp-mcp binary. The host forks the stdio child, opens HTTP connections to the remote ones, and presents the union of all tool surfaces to the agent. The agent then chains create_draft (Gmail) plus whatsapp_search plus whatsapp_send_message in a single turn.",
  },
  {
    q: "What does verified delivery actually mean for the WhatsApp half?",
    a: "After whatsapp_send_message presses Return, the WhatsApp MCP child sleeps 1.0 second and re-traverses the WhatsApp app's accessibility tree (Sources/WhatsAppMCP/main.swift, line 924). It collects every AXGenericElement, looks for one whose description begins with the literal string 'Your message, ', strips the timestamp suffix with a regex, and compares the resulting text against what the agent asked to send. If it matches, the JSON response carries verified:true. If not, the response still carries success:true (because Cmd+V plus Return was issued) but flips verified to false and includes the last bubble it found in a warning field. This is observation of the rendered chat, not a delivery webhook.",
  },
  {
    q: "Does pairing Google MCP with WhatsApp MCP need any special infrastructure?",
    a: "No server, no proxy, no glue service. The MCP host is the only integrator. You add the WhatsApp entry to the same JSON file that already lists your Google entries, restart the host, and the agent sees both tool surfaces at once. The cross-server chain (call Gmail, then call WhatsApp) is just two tool calls in the same turn from the agent's perspective. The state shared between them is whatever the agent puts into the prompt, not anything the servers know about each other.",
  },
  {
    q: "Is the Google Workspace MCP a remote OAuth surface or a local one?",
    a: "Remote. Each Google MCP server is hosted at a googleapis.com endpoint and authenticated via OAuth 2.0. Configuration differs slightly by client: Gemini CLI uses Desktop-app OAuth credentials in settings.json; Claude needs Web-application credentials with redirect URI https://claude.ai/api/mcp/auth_callback; other clients need HTTP transport with OAuth 2.0 support. To use Google's remote MCP servers from Claude.ai or Claude Desktop, you need an Enterprise, Pro, Max, or Team plan. WhatsApp MCP imposes none of this; it is local stdio with macOS Accessibility as the only gate.",
  },
  {
    q: "Can the agent run Workspace MCP and WhatsApp MCP from the same prompt?",
    a: "Yes, that is the entire point of the host model. A single tools/list call returns the union of every server's tool surface; the host routes each tools/call to the child that owns the named tool. From the agent's perspective there is no boundary between the Google half and the WhatsApp half, just a longer list of tools. The trade-off is that two of the children speak HTTP+OAuth to googleapis.com and one speaks stdio to a local Swift process, but the host abstracts that.",
  },
  {
    q: "What if I want notifications and not chat? Pub/Sub looks like it should work.",
    a: "Pub/Sub is machine-to-machine. It moves bytes between services. There is no human reader on the other end of a Pub/Sub topic unless you build the consumer side (a worker that reads the topic and pushes to email, push, or chat). The published Pub/Sub MCP exposes topic CRUD and publish, but the consumer of those messages has to be wired separately. For a real human-to-human notification you want either Gmail (if email is the channel) or a non-Google MCP that talks to the actual chat surface the human uses.",
  },
  {
    q: "Can I do this without Workspace MCP at all and just use WhatsApp MCP?",
    a: "Yes. WhatsApp MCP runs standalone with a single config entry and grants you 11 tools (search, open, send, read, list, navigate, scroll, status, start, quit, get_active_chat). For a flow that is purely WhatsApp-side (replies, follow-ups, reminders), the Google half is not needed. The pairing only matters when the agent is doing some Google-side reasoning (parsing email threads, scheduling on a calendar, looking up Drive files) and then needs to surface the result to a human who lives on WhatsApp.",
  },
  {
    q: "Are there cases where this catalog grows and the empty cell goes away?",
    a: "Possibly. The published Google MCP catalog is growing fast (Cloud Run, Cloud Storage, Resource Manager, Pub/Sub, Dataplex were all listed as in flight as of early 2026). Workspace's Chat MCP could plausibly add a send_message in a future release, which would close the in-Workspace loop, though it still would not reach a non-Google user. Gmail could plausibly add an autonomous send_message, which would close the email-side loop. Neither of those would extend Google's MCP into WhatsApp, SMS, iMessage, Telegram, or any consumer surface outside Google's perimeter. That cell stays empty until either Google or a third party publishes a server for the corresponding app. WhatsApp MCP for macOS is the third-party answer for one of those cells.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "Google MCP servers, scored by whether any of them can reach a non-Google human",
    description:
      "Google's official MCP catalog covers BigQuery, GKE, Compute Engine, Workspace (Gmail, Drive, Calendar, Chat, People), Maps, and most data services. Across all of it, exactly one tool surface (Gmail's create_draft) puts text in front of a person, and even that one does not autonomously send. Chat MCP is read-only. This page maps the catalog and shows the WhatsApp MCP shape that fills the empty cell.",
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

function CapabilityBadge({ kind }: { kind: CatalogRow["outboundToHuman"] }) {
  if (kind === "yes") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium px-2 py-0.5">
        send to human
      </span>
    );
  }
  if (kind === "draft-only") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium px-2 py-0.5">
        draft only
      </span>
    );
  }
  if (kind === "internal-only") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium px-2 py-0.5">
        google only
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 text-zinc-500 text-xs font-medium px-2 py-0.5">
      none
    </span>
  );
}

export default function GoogleMcpServerPage() {
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
              The empty cell in Google&apos;s MCP catalog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              Google ships 35+ official MCP servers.{" "}
              <GradientText>Exactly zero of them can autonomously send a message to someone outside a Google domain.</GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-6 max-w-2xl">
              I read every page in Google&apos;s published MCP catalog and graded each
              server on one column: can the agent use this to put text in front of a
              specific human? BigQuery, Spanner, GKE, Cloud Run, Pub/Sub, Maps,
              Drive, all <strong>none</strong>. Calendar gives an internal invite.
              Gmail has <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">create_draft</code> but no autonomous send. Chat ships
              two tools, both read-only.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              That gap is not a bug in Google&apos;s strategy. It is the natural
              shape of a cloud-first MCP layer. The fix, if your agent has to reach
              a real customer in Brazil, India, MENA, or anywhere WhatsApp is the
              default chat app, is a second MCP child that drives the WhatsApp
              desktop app on macOS through accessibility APIs and verifies the
              bubble landed in the chat.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#catalog">
                See the catalog table
              </ShimmerButton>
              <a
                href="https://github.com/m13v/whatsapp-mcp-macos"
                className="text-sm font-medium text-teal-700 hover:text-teal-600"
              >
                whatsapp-mcp-macos source &rarr;
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
            readingTime="11 min read"
            author="Matthew Diakonov"
            authorRole="Written with AI"
          />
        </div>

        <section id="catalog" className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The catalog, scored by outbound-to-human capability
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            One row per server published in Google&apos;s MCP documentation as of
            April 2026. The grading column answers a single question: if the agent
            holds this tool surface, can it autonomously deliver a message to a
            specific person? &quot;None&quot; means the server has no notion of an
            outbound human channel at all. &quot;Google only&quot; means it can
            reach Google-domain users via Google&apos;s own notification plumbing.
            &quot;Draft only&quot; means it can compose but not send. The
            &quot;send to human&quot; column is empty across every Google
            server.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-3 text-zinc-500 font-medium">Server</th>
                  <th className="px-4 py-3 text-zinc-500 font-medium hidden md:table-cell">
                    Family
                  </th>
                  <th className="px-4 py-3 text-zinc-500 font-medium hidden lg:table-cell">
                    Tools (sample)
                  </th>
                  <th className="px-4 py-3 text-zinc-500 font-medium">
                    Outbound to a human
                  </th>
                  <th className="px-4 py-3 text-zinc-500 font-medium hidden md:table-cell">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {catalog.map((row, i) => (
                  <tr
                    key={row.server}
                    className={
                      i < catalog.length - 1
                        ? "border-b border-zinc-100"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 text-zinc-900 font-medium">
                      {row.server}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">
                      {row.family}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden lg:table-cell font-mono text-xs">
                      {row.tools}
                    </td>
                    <td className="px-4 py-3">
                      <CapabilityBadge kind={row.outboundToHuman} />
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden md:table-cell text-xs leading-relaxed">
                      {row.note}
                    </td>
                  </tr>
                ))}
                <tr className="bg-teal-50/40 border-t-2 border-teal-200">
                  <td className="px-4 py-3 text-zinc-900 font-semibold">
                    WhatsApp (third-party, macOS)
                  </td>
                  <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">
                    Consumer chat
                  </td>
                  <td className="px-4 py-3 text-zinc-500 hidden lg:table-cell font-mono text-xs">
                    11 (search, send, read, list, navigate)
                  </td>
                  <td className="px-4 py-3">
                    <CapabilityBadge kind="yes" />
                  </td>
                  <td className="px-4 py-3 text-zinc-500 hidden md:table-cell text-xs leading-relaxed">
                    Drives the macOS WhatsApp app via accessibility APIs.
                    whatsapp_send_message returns verified:true after re-reading
                    the chat.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500 mt-4">
            Sources: developers.google.com/workspace/guides/configure-mcp-servers
            (Workspace tool counts), docs.cloud.google.com/mcp/supported-products
            (Cloud catalog), cloud.google.com/blog/products/ai-machine-learning/announcing-official-mcp-support-for-google-services.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Why the empty column is the natural shape
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Google&apos;s MCP strategy is, correctly, a cloud-first one. The
            servers expose what the cloud itself owns: warehouse rows, container
            workloads, Kubernetes objects, blob buckets, log streams, calendars,
            email metadata. None of those primitives are outbound channels. They
            are state. The agent reasons over the state, runs jobs, and writes
            state back. The reader at the end of the loop is a developer or an
            analyst, not a customer.
          </p>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            The two corners that brush up against human delivery are Gmail and
            Calendar. Both are real channels, but both terminate at the
            customer&apos;s email address. For the segment of agents whose users
            live on email, that is enough. For the segment whose users live on
            WhatsApp (most of Latin America, most of South Asia, most of MENA,
            increasingly most of Southeast Asia), email is a write-only audit
            log. The customer never opens it. The Gmail draft sits unread, the
            calendar invite goes into a mailbox the customer hasn&apos;t looked
            at since 2022, and the agent&apos;s loop does not actually close.
          </p>
          <p className="text-zinc-600 leading-relaxed">
            What the catalog needs, for that segment, is a cell that says
            &quot;this server can deliver to the place the customer actually
            reads.&quot; That cell is empty in Google&apos;s catalog because
            Google does not own a consumer chat app with global penetration.
            Allo, Hangouts, Duo, Spaces are all gone or organizational.
            WhatsApp belongs to Meta. The cell stays empty until somebody
            outside Google ships a server.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            One host, several Google children, one WhatsApp child
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            The MCP host (Claude Code, Cursor, Claude Desktop) does not care
            whether a server speaks HTTP+OAuth to googleapis.com or stdio to a
            local binary. Each entry in the config becomes its own connection.
            The agent sees the union of all tool surfaces and chains across them
            in a single turn.
          </p>
          <AnimatedBeam
            title="agent loop spans Google MCP and WhatsApp MCP in one turn"
            from={[
              { label: "search_threads", sublabel: "Gmail MCP, read" },
              { label: "list_events", sublabel: "Calendar MCP, read" },
              { label: "list_recent_files", sublabel: "Drive MCP, read" },
            ]}
            hub={{ label: "host (Claude / Cursor)", sublabel: "agent loop" }}
            to={[
              { label: "whatsapp_search", sublabel: "WhatsApp MCP, find chat" },
              {
                label: "whatsapp_send_message",
                sublabel: "verified send",
              },
              { label: "create_draft", sublabel: "Gmail MCP, audit trail" },
            ]}
          />
          <p className="text-sm text-zinc-500 mt-4 text-center max-w-2xl mx-auto">
            Google&apos;s servers handle the read-side context (email threads,
            calendars, files). WhatsApp MCP handles delivery. The agent does the
            integration; neither side knows about the other.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            The merged config: Google over OAuth, WhatsApp over stdio
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            The host config below has three children. Two are Google&apos;s
            remote HTTP servers, gated by OAuth scopes. The third is a local
            Swift binary installed via{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              npm install -g whatsapp-mcp-macos
            </code>
            . Restart the host and the agent sees all three tool surfaces at
            once.
          </p>
          <AnimatedCodeBlock
            code={mergedConfigCode}
            language="json"
            filename="~/.claude.json (excerpt, mixed transports)"
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            The OAuth flow is initiated the first time the host connects. For
            Claude.ai or Claude Desktop, this requires a paid plan. The
            WhatsApp half has no auth flow; it requires only that the WhatsApp
            app is installed (App Store) and that the host process has been
            granted Accessibility permission in System Settings &gt; Privacy &amp;
            Security &gt; Accessibility.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16" id="walkthrough">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            One full agent loop, end to end
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Concrete shape: the agent reads the customer&apos;s last email
            thread, sees that the customer has not replied in a week, picks them
            up on WhatsApp, sends a follow-up, verifies the bubble appeared, and
            writes the result back into a Gmail draft so the operator has a
            paper trail.
          </p>
          <StepTimeline steps={walkthroughSteps} />
        </section>

        <GlowCard className="max-w-4xl mx-auto px-6 my-16">
          <div className="p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-3">
              anchor fact
            </p>
            <h3 className="text-2xl font-bold text-zinc-900 mb-3">
              Google&apos;s Chat MCP ships exactly two tools. Both are read-only.
            </h3>
            <p className="text-zinc-600 leading-relaxed mb-4">
              Per the published Workspace MCP configuration page, the Chat MCP
              surface is{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                search_conversations
              </code>{" "}
              and{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                list_messages
              </code>
              . There is no{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                create_message
              </code>
              , no{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                post_to_space
              </code>
              , no{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                send
              </code>
              . The Chat REST API supports posting, but the MCP layer above it
              does not expose it. The agent that reads a Chat space cannot
              reply through the same MCP server.
            </p>
            <p className="text-zinc-600 leading-relaxed">
              For comparison, WhatsApp MCP&apos;s send path is{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                Sources/WhatsAppMCP/main.swift
              </code>{" "}
              line <strong>920</strong> onward: paste, press Return, sleep 1.0s,
              re-walk the AX tree, and look for an{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                AXGenericElement
              </code>{" "}
              whose description begins with the literal prefix{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                Your message,{" "}
              </code>{" "}
              (line <strong>930</strong>). Found means{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                verified:true
              </code>
              . That one prefix scan is the single observation Google&apos;s MCP
              servers cannot produce, because none of them can issue the send
              that would make the bubble exist in the first place.
            </p>
          </div>
        </GlowCard>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            The verification, in source
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Worth showing because most discussions of MCP message delivery
            describe verification as a black box. Here it is plain Swift, eight
            lines, against the AX tree.
          </p>
          <AnimatedCodeBlock
            code={verificationCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift, line 920"
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            If the prefix scan finds a match, the JSON response carries{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              verified:true
            </code>
            . If not, the response still says{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              success:true
            </code>{" "}
            (Cmd+V plus Return was issued) but flips{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              verified
            </code>{" "}
            to false and includes the last bubble it could find in a warning
            field. The agent then has enough to retry, escalate, or surface the
            failure to the operator. None of the Google servers exposes anything
            in this shape because none of them is observing a rendered chat in
            the first place.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <ComparisonTable
            heading="Google Workspace MCP delivery vs WhatsApp MCP delivery"
            intro="Same agent, two outbound surfaces, very different reach and shape."
            productName="WhatsApp MCP (macOS, AX-driven)"
            competitorName="Google Workspace MCP (Gmail / Calendar)"
            rows={compareRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            When Google&apos;s catalog is enough on its own
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            For an agent operating inside a Google org, against G Suite
            users, where everyone reads email and lives on Calendar, the
            Workspace MCP surface (Gmail plus Calendar plus Drive plus Chat plus
            People) is plenty. The empty cell I&apos;m describing only matters
            once the audience extends to people who are not on Google. If your
            user base is a US-based SaaS team, you probably do not need this
            page.
          </p>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            For an agent serving a small operator in Brazil, India, Mexico, the
            UAE, or Indonesia, the email channel is effectively closed. Those
            customers reply on WhatsApp, full stop. The Gmail draft is a paper
            trail, not a delivery primitive. In that segment, the Google MCP
            servers handle the reasoning and the audit log; WhatsApp MCP handles
            the only channel the customer actually reads.
          </p>
          <p className="text-zinc-600 leading-relaxed">
            That is the entire pairing. The Google servers are not wrong; they
            are aimed at a different user. Adding one local stdio child fills
            the cell that the cloud-first catalog can&apos;t fill from the
            cloud.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Wiring Google Workspace MCP into a flow that has to reach a non-Google user?"
          description="30 minutes on the merged config, the OAuth shape on Google's side, the AX-tree verification on the WhatsApp side, and the cases where you genuinely don't need WhatsApp at all."
        />

        <FaqSection items={faqItems} />

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Talk through Google MCP plus WhatsApp MCP delivery on a 30-minute call"
        />
      </article>
    </>
  );
}
