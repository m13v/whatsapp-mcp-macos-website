import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  ComparisonTable,
  SequenceDiagram,
  BookCallCTA,
  GlowCard,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://whatsapp-mcp-macos.com/t/opensearch-mcp-server";
const PUBLISHED = "2026-04-29";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "OpenSearch MCP server is the textbook stateless MCP. Some MCP servers cannot be that.",
  description:
    "OpenSearch MCP server is the canonical example of a stateless MCP server. Every tool call is self-contained because the data is keyed by document id. WhatsApp MCP for macOS is the opposite: its search tool leaves the UI open and the next call consumes that state by index. Two designs, side by side.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "OpenSearch MCP server is stateless by design. WhatsApp MCP cannot be.",
    description:
      "Stateless tool surfaces work when the data is queryable by id (OpenSearch). Stateful tool surfaces appear when the data lives in a UI and you have to walk it (WhatsApp on macOS). Same protocol, different design moves.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Stateless vs stateful MCP: OpenSearch MCP server contrasted with WhatsApp MCP",
    description:
      "OpenSearch's SearchIndexTool is stateless. WhatsApp MCP's whatsapp_search leaves the UI open and the next call consumes the state by index. Side-by-side breakdown of both architectures.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "OpenSearch MCP server" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "OpenSearch MCP server", url: PAGE_URL },
];

const opensearchToolsCode = `# opensearch-project/opensearch-mcp-server-py
# Default-on tools. Each one is self-contained:
# the agent passes parameters, the server hits an OpenSearch
# REST endpoint, and the response is keyed by document _id
# or by index name. Nothing on the server has to remember
# what happened in the previous call.

ListIndexTool
IndexMappingTool
SearchIndexTool
GetShardsTool
ClusterHealthTool
CountTool
ExplainTool
MsearchTool
GenericOpenSearchApiTool

# Optional, off-by-default tool groups also exist:
# cluster state, segments, hot threads, allocation,
# query insights, log pattern analysis, search-relevance
# experiments, and a long list of judgment-list tools.`;

const whatsappToolsCode = `// whatsapp-mcp-macos / Sources/WhatsAppMCP/main.swift, line 1110
// Eleven tools. Two of them are deliberately stateful.

let allTools = [
    statusTool,
    startTool,
    quitTool,
    getActiveChatTool,
    listChatsTool,
    searchTool,         // whatsapp_search:      leaves UI state open
    openChatTool,       // whatsapp_open_chat:   consumes that state by index
    scrollSearchTool,   // whatsapp_scroll_search: extends the same open UI
    readMessagesTool,
    sendMessageTool,
    navigateTool,
]`;

const searchOpenSnippet = `// Sources/WhatsAppMCP/main.swift
// Lines 716 to 744 (paraphrased for length).

// whatsapp_search:
//   types query into sidebar search,
//   returns indexed results,
//   leaves search OPEN.
func handleSearch(args: [String: Value]?) throws -> String {
    let query = try getRequiredString(from: args, key: "query")
    let pid   = try ensureWhatsAppRunning()
    activateWhatsApp(pid: pid)

    // ... type query into the WhatsApp sidebar search field ...

    let resultElements = traverseAXTree(pid: pid)
    let results = parseVisibleSearchResults(from: resultElements)

    // NOTE: search is left OPEN so caller
    //       can use whatsapp_open_chat with an index
    return serializeToJsonString(results) ?? "[]"
}`;

const openChatSnippet = `// Sources/WhatsAppMCP/main.swift
// Lines 746 to 792 (paraphrased for length).

// whatsapp_open_chat:
//   clicks the Nth search result,
//   then reports active chat.
func handleOpenChat(args: [String: Value]?) throws -> String {
    let index = (try getOptionalInt(from: args, key: "index")) ?? 0
    let pid   = try ensureWhatsAppRunning()
    activateWhatsApp(pid: pid)

    let elements = traverseAXTree(pid: pid)
    // Re-parses the SAME open UI the previous call left behind.
    // 'index' is positional in that live UI, not a stable id.
    let candidates = collectSearchResultButtons(from: elements)

    guard index < candidates.count else {
        pressEscape()
        return "{\\"success\\": false, \\"error\\": \\"Index out of range.\\"}"
    }

    clickElement(candidates[index])
    let activeName = getActiveChatName(pid: pid)
    return "{\\"success\\": true, \\"active_chat\\": \\"\\(activeName ?? "")\\"}"
}`;

const opensearchSearchSnippet = `# opensearch-project/opensearch-mcp-server-py
# SearchIndexTool — paraphrased.
#
# Stateless: each call sends a fully-formed query body
# to /<index>/_search and returns the hits.
# The "next page" is just another self-contained call
# with from + size, or with a search_after value.

def search_index(index: str, query_body: dict) -> dict:
    response = client.search(
        index=index,
        body=query_body,   # query, from, size, search_after, ...
    )
    return {
        "hits": [
            {
                "_id":    h["_id"],
                "_score": h["_score"],
                "_source": h["_source"],
            }
            for h in response["hits"]["hits"]
        ],
        "total": response["hits"]["total"]["value"],
    }`;

const sequenceActorsOs = ["Agent", "MCP", "OpenSearch"];
const sequenceMessagesOs = [
  {
    from: 0,
    to: 1,
    label: "tools/call SearchIndexTool",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "POST /<index>/_search",
    type: "request" as const,
  },
  { from: 2, to: 1, label: "200 OK + hits[]", type: "response" as const },
  { from: 1, to: 0, label: "result keyed by _id", type: "response" as const },
];

const sequenceActorsWa = ["Agent", "MCP", "WhatsApp app"];
const sequenceMessagesWa = [
  {
    from: 0,
    to: 1,
    label: "tools/call whatsapp_search",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "type into sidebar search",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "AX tree: result buttons",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "result list, indexed",
    type: "response" as const,
  },
  {
    from: 1,
    to: 1,
    label: "(search field stays open)",
    type: "event" as const,
  },
  {
    from: 0,
    to: 1,
    label: "tools/call whatsapp_open_chat(index=2)",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "click button at ordinal 2",
    type: "request" as const,
  },
  { from: 2, to: 1, label: "active chat name", type: "response" as const },
];

const compareRows = [
  {
    feature: "What the data lives in",
    competitor: "An OpenSearch cluster, indexed by document _id.",
    ours: "The visible WhatsApp Catalyst window, addressed by AX tree position.",
  },
  {
    feature: "How a tool call resolves",
    competitor:
      "Server makes one HTTPS call to a REST endpoint and returns the response.",
    ours: "Server walks AXUIElement, types or clicks, re-walks the tree, returns a parsed slice.",
  },
  {
    feature: "Identifier the agent uses next",
    competitor: "Document _id from the previous hit. Stable across calls.",
    ours: "0-based ordinal in the result list. Only meaningful while the UI is still open.",
  },
  {
    feature: "Pagination",
    competitor:
      "Stateless: the agent re-sends the query with from/size or search_after.",
    ours: "Stateful: whatsapp_scroll_search extends the same open search UI.",
  },
  {
    feature: "Per-call independence",
    competitor:
      "Each tool call is self-contained. Tools/list order does not matter.",
    ours: "whatsapp_open_chat assumes whatsapp_search ran most recently. Order matters.",
  },
  {
    feature: "Where the server runs",
    competitor:
      "Anywhere with HTTPS to the OpenSearch endpoint. Hosted variants exist.",
    ours: "On the same Mac as the WhatsApp Catalyst app. Local stdio only.",
  },
  {
    feature: "Failure mode the agent has to handle",
    competitor: "401 (auth), 404 (no such index), 5xx (cluster unhealthy).",
    ours: "Search field not found, no results visible, index out of range, UI raced.",
  },
  {
    feature: "Why the design is what it is",
    competitor:
      "OpenSearch already exposes a stable, queryable, REST surface. Pass it through.",
    ours: "WhatsApp on macOS does not expose any single-user API. Drive the UI.",
  },
];

const faqItems = [
  {
    q: "What does OpenSearch MCP server actually do?",
    a: "It is a Python MCP server, published by the OpenSearch project at github.com/opensearch-project/opensearch-mcp-server-py, that exposes OpenSearch cluster operations as MCP tools. The default-on surface includes ListIndexTool, IndexMappingTool, SearchIndexTool, GetShardsTool, ClusterHealthTool, CountTool, ExplainTool, MsearchTool, and GenericOpenSearchApiTool. It supports stdio and streaming transports (SSE and Streamable HTTP), runs as its own process, and can be installed from PyPI. Functionally, every tool is a thin wrapper over a REST endpoint on the OpenSearch cluster the server is configured to talk to. There is no per-server long-lived state between calls, because the data already lives in the cluster and is addressable by index name and document id.",
  },
  {
    q: "Is the OpenSearch MCP server stateless on every call?",
    a: "Yes, in the sense that matters here. The server itself does not have to remember the result of the previous tool call to make sense of the current one. SearchIndexTool returns hits keyed by document _id, and the agent's follow-up call (a get-by-id, an explain, another search) carries the _id forward. There is no UI to keep open and no positional ordinal that would go stale if you waited a minute. That is what makes OpenSearch MCP server such a clean reference design: the data store already does the work of giving every entity a stable handle, and the MCP layer can just pass it through.",
  },
  {
    q: "Why does this page contrast OpenSearch MCP server with WhatsApp MCP?",
    a: "Because the two are at opposite ends of the design space, and seeing them next to each other clarifies what is actually a choice and what is forced by the data source. OpenSearch MCP server can be stateless because OpenSearch gives every document a stable id and accepts arbitrary search bodies over REST. WhatsApp MCP for macOS cannot be stateless. The data is the contents of a running Catalyst window, and the only handle on a particular search result is its position in the live AX tree. So the server's whatsapp_search tool deliberately leaves the search UI open, returns results with 0-based indices, and tells the next tool call (whatsapp_open_chat) to use one of those indices. The contrast is the most useful frame I know for thinking about MCP server design.",
  },
  {
    q: "Where exactly is the stateful tool surface in WhatsApp MCP defined?",
    a: "Sources/WhatsAppMCP/main.swift in the m13v/whatsapp-mcp-macos repository. The whatsapp_search tool is declared on line 1032 onward, and its description string contains the literal sentence \"Leaves search OPEN, call whatsapp_open_chat(index) to select a result.\" The implementation behind it (handleSearch, around line 716) ends with a comment that says \"search is left OPEN so caller can use whatsapp_open_chat with an index.\" The whatsapp_open_chat tool sits right next to it (line 1048 onward, with handleOpenChat at line 746), and its only meaningful argument is a 0-based index that addresses the search results from the previous call by position. There are eleven tools in total, and that two-tool handshake is the part that breaks the stateless mold.",
  },
  {
    q: "How does each pattern handle pagination?",
    a: "OpenSearch MCP server delegates pagination to the OpenSearch query body. The agent sets from and size in a SearchIndexTool call, or uses search_after with a sort cursor for deep pages. Each follow-up call is self-contained: same query body shape, different range. The server does not have to remember the previous page. WhatsApp MCP cannot do that. The 'corpus' is whatever the WhatsApp sidebar is currently showing, and there is no offset parameter exposed by the app. So the server adds a third tool, whatsapp_scroll_search, that scrolls within the still-open results list to load more and then re-traverses the tree. The next whatsapp_open_chat call then references the now-larger list. Pagination is done by extending the open UI rather than by sending a new query.",
  },
  {
    q: "When is each pattern the right one to reach for?",
    a: "Reach for the OpenSearch shape when the data source already has three properties: a stable per-record identifier, a queryable interface (REST or RPC) that accepts arbitrary filters, and a permission story you can express in tokens. That covers OpenSearch, Elasticsearch, Postgres-with-an-API, Stripe, Linear, Notion, GitHub, Slack, and most modern SaaS. Reach for the WhatsApp shape when the data source is a desktop or Catalyst app, the records have no public id, and the only stable handle is 'whatever is on screen right now.' That covers WhatsApp on macOS, iMessage, Apple Notes, Things, Bear, and most native macOS apps. The mistake is to write the wrong one: a stateful UI walker on top of OpenSearch is over-engineering, and a stateless REST passthrough on top of WhatsApp Web is undefined behavior the moment the DOM changes.",
  },
  {
    q: "Can these two MCP servers run side by side in the same agent host?",
    a: "Yes. MCP hosts (Claude Desktop, Claude Code, Cursor, Windsurf) read a JSON config that lists servers and how to launch each. OpenSearch MCP server typically runs as a stdio child started by the host (or as an HTTP entry pointing at an SSE endpoint). WhatsApp MCP runs as a stdio child too, but it has to be launched on the same Mac as the WhatsApp Catalyst app. The host forks both, presents the union of tools to the agent, and a single agent turn can call SearchIndexTool against your log cluster and then whatsapp_send_message to ping the on-call engineer. The agent does not see any boundary between the two servers.",
  },
  {
    q: "Does the stateful design in WhatsApp MCP create reliability problems?",
    a: "It creates problems the stateless design does not have, and the server's tool descriptions push those problems back onto the calling agent rather than hiding them. whatsapp_open_chat returns the active_chat name and tells the agent to verify it matches the intended contact, because the index from the previous whatsapp_search call may have shifted if the user did anything in WhatsApp in between. whatsapp_scroll_search returns the freshly parsed full result list rather than a delta, so the agent can re-anchor on names. whatsapp_send_message refuses to run unless a chat is currently open, because the only place a sent message can land is the active chat. None of these are necessary for OpenSearch MCP server, and that is exactly the point: a stateless surface lets the server hide more of the world from the agent, while a stateful surface forces the agent to participate in keeping the world consistent.",
  },
  {
    q: "What should I take away if I am writing my own MCP server?",
    a: "Look at the data source first. If it gives you stable ids and a query API, copy the OpenSearch shape: small tools, each call self-contained, identifiers in returns that the agent passes back later. If it gives you a UI and nothing else, copy the WhatsApp shape: tool descriptions that explicitly say what is left open, return values that include positional indices, follow-up tools that consume those indices, and an explicit verification tool the agent can use to confirm reality before any irreversible action. The MCP protocol does not pick for you. The shape your tool surface ends up taking is mostly a function of how addressable the underlying data already is.",
  },
  {
    q: "Where can I read both servers' source?",
    a: "OpenSearch MCP server is at github.com/opensearch-project/opensearch-mcp-server-py. Its README lists the default-on tool surface and the optional tool groups, plus instructions for stdio and streaming transports. WhatsApp MCP for macOS is at github.com/m13v/whatsapp-mcp-macos. The Sources/WhatsAppMCP/main.swift file contains the eleven tool definitions on line 1110 onward, the stateful search/open-chat handshake at lines 716 to 792, and the eleven-tool dispatch table immediately after.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "OpenSearch MCP server is a stateless reference design. Some MCP servers cannot be that.",
    description:
      "OpenSearch MCP server is the canonical stateless MCP: every tool call is self-contained because OpenSearch already gives every document a stable id. WhatsApp MCP for macOS is the opposite design: its whatsapp_search tool deliberately leaves the UI open, and whatsapp_open_chat consumes that state by ordinal index. This page walks both designs side by side, with code from each.",
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

export default function OpenSearchMcpServerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="pb-24">
        <section className="max-w-3xl mx-auto px-6 pt-16 md:pt-20">
          <Breadcrumbs items={breadcrumbItems} />
          <span className="mt-8 inline-block bg-teal-50 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full">
            Stateless vs stateful MCP
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.05]">
            OpenSearch MCP server is the textbook stateless design. Some MCP
            servers cannot be that, and the contrast is the most useful thing
            you can learn about MCP.
          </h1>
          <p className="mt-6 text-lg text-zinc-600">
            OpenSearch already gives every document a stable{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              _id
            </code>{" "}
            and accepts arbitrary search bodies over REST. So{" "}
            <a
              href="https://github.com/opensearch-project/opensearch-mcp-server-py"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              opensearch-mcp-server-py
            </a>{" "}
            can be a thin facade: each tool call is self-contained, hits one
            endpoint, returns hits keyed by id, and the agent carries those ids
            forward.
          </p>
          <p className="mt-4 text-lg text-zinc-600">
            That is what people mean when they say MCP servers are simple. It
            assumes the data store underneath has already done the hard work of
            making every record addressable. When that assumption breaks, the
            shape of the MCP server breaks with it. WhatsApp MCP for macOS is
            the cleanest case I know of an MCP server that had to be designed
            stateful on purpose. I&apos;ll walk both, with code, then come back
            to what to copy and what not to.
          </p>
          <div className="mt-4 mb-8">
            <ArticleMeta
              datePublished={PUBLISHED}
              readingTime="11 min read"
              author="Matthew Diakonov"
              authorRole="Written with AI"
            />
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What the OpenSearch MCP server actually exposes
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The repository at{" "}
            <a
              href="https://github.com/opensearch-project/opensearch-mcp-server-py"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              github.com/opensearch-project/opensearch-mcp-server-py
            </a>{" "}
            is a Python project published by the OpenSearch project itself. You
            install it from PyPI, point it at a cluster, and it speaks MCP over
            stdio or over a streaming transport (SSE or Streamable HTTP). The
            default-on tool surface is small and shaped like the OpenSearch
            REST API.
          </p>
          <AnimatedCodeBlock
            code={opensearchToolsCode}
            language="python"
            filename="opensearch-mcp-server-py / default tools"
          />
          <p className="text-zinc-700 leading-relaxed mt-6">
            Every one of those tools is independent of the others. Calling{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              SearchIndexTool
            </code>{" "}
            does not put the server into a mode that subsequent calls have to
            respect. The hits come back keyed by document{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              _id
            </code>
            , and the agent passes those ids forward into{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              ExplainTool
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              GetShardsTool
            </code>
            , another search, or whatever else makes sense. Pagination is
            another self-contained call: same query body, different{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              from
            </code>{" "}
            and{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              size
            </code>
            , or a{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              search_after
            </code>{" "}
            cursor.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What stateless looks like in code
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Here is the shape of the search tool, paraphrased to the part that
            matters. There is no instance variable on the server that survives
            past the return statement. The query body is fully self-describing,
            and the response is just a projection of the upstream result.
          </p>
          <AnimatedCodeBlock
            code={opensearchSearchSnippet}
            language="python"
            filename="SearchIndexTool (paraphrased)"
          />
          <p className="text-zinc-700 leading-relaxed mt-6">
            That shape is what most readers expect when they hear &quot;MCP
            server.&quot; Tools as named functions. Each tool maps to one
            upstream call. Identifiers in the response that survive across
            calls. Order of calls is irrelevant beyond what the agent decides.
            For OpenSearch the shape is correct, and the project ships exactly
            it.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The shape on the wire is the same. The shape of the data is not.
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            JSON-RPC framing is identical for any MCP server. Stateless or
            stateful, the bytes between the host and the server look the same.
            What differs is what the server does inside the call, and what the
            return value lets the next call do.
          </p>
          <SequenceDiagram
            title="OpenSearch MCP / stateless"
            actors={sequenceActorsOs}
            messages={sequenceMessagesOs}
          />
          <p className="text-zinc-700 leading-relaxed mt-6 mb-6">
            One round trip per tool call. The reply carries{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              _id
            </code>
            s. The agent picks one and uses it later. Nothing on the server
            persists. Now compare against an MCP that has no stable id to
            return, because there is no database underneath, just a UI.
          </p>
          <SequenceDiagram
            title="WhatsApp MCP / stateful"
            actors={sequenceActorsWa}
            messages={sequenceMessagesWa}
          />
          <p className="text-zinc-700 leading-relaxed mt-6">
            Two round trips, deliberately. The first one types into the
            sidebar, parses the visible result buttons out of the accessibility
            tree, and returns them with 0-based indices. It does{" "}
            <em>not</em> close the search field. The second tool call,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_open_chat
            </code>
            , takes one of those indices and clicks the button at that ordinal
            position in the still-open UI. The state lives in WhatsApp, not in
            the MCP server, but the MCP server is responsible for not
            disturbing it between calls.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The two-tool handshake, in source
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The relevant code is in{" "}
            <a
              href="https://github.com/m13v/whatsapp-mcp-macos/blob/main/Sources/WhatsAppMCP/main.swift"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              Sources/WhatsAppMCP/main.swift
            </a>
            . The first half is the search tool. The comment at the bottom of
            the function is load-bearing: it is the contract the next call
            depends on.
          </p>
          <AnimatedCodeBlock
            code={searchOpenSnippet}
            language="swift"
            filename="handleSearch / lines 716-744 (paraphrased)"
          />
          <p className="text-zinc-700 leading-relaxed mt-6 mb-4">
            The follow-up tool is right below it. The argument it accepts is a
            single integer. The tool description, declared further down in the
            file at line 1050, instructs the agent to call{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_search
            </code>{" "}
            first and then pass through the index. The implementation re-walks
            the AX tree, collects the same result buttons, and clicks the one
            at that ordinal.
          </p>
          <AnimatedCodeBlock
            code={openChatSnippet}
            language="swift"
            filename="handleOpenChat / lines 746-792 (paraphrased)"
          />
          <p className="text-zinc-700 leading-relaxed mt-6">
            That ordinal is the entire identifier. There is no document id, no
            phone number used as a key, no stable handle the way OpenSearch
            hands you a{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              _id
            </code>
            . The agent has only the position of the result in the live UI,
            and the position only stays valid as long as the search is open
            and nobody else moves around in WhatsApp. That is the cost of not
            having a queryable data store underneath.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The full tool surfaces, side by side
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            OpenSearch&apos;s default-on tools cover index management, search,
            and a few diagnostic primitives. WhatsApp MCP&apos;s eleven tools
            cover a much narrower domain (one app on one OS) but two of them
            are deliberately stateful in a way no OpenSearch tool is.
          </p>
          <GlowCard className="my-6">
            <AnimatedCodeBlock
              code={whatsappToolsCode}
              language="swift"
              filename="WhatsApp MCP / setupAndStartServer (line 1110)"
            />
          </GlowCard>
          <p className="text-zinc-700 leading-relaxed mt-4">
            Three tools form the search-and-open-a-chat handshake:{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_search
            </code>{" "}
            opens the search UI and returns indexed results,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_scroll_search
            </code>{" "}
            extends the same open UI with more results, and{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_open_chat
            </code>{" "}
            consumes one of the indices to actually navigate. Neither
            OpenSearch&apos;s SearchIndexTool nor MsearchTool need a partner
            tool to land a result. They return enough by themselves.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">
            Per-feature breakdown
          </h2>
          <p className="text-zinc-600 mb-8">
            What changes between the two designs, and why each change is forced
            by the data source rather than by taste.
          </p>
          <ComparisonTable
            productName="WhatsApp MCP for macOS"
            competitorName="OpenSearch MCP server"
            rows={compareRows}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Which shape should you reach for
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The decision is almost entirely a function of what is on the other
            side of your MCP server, not of what the protocol allows.
          </p>
          <ol className="space-y-5 text-zinc-700 leading-relaxed list-decimal pl-6">
            <li>
              <strong className="text-zinc-900">
                A queryable store with stable record ids.
              </strong>{" "}
              OpenSearch, Elasticsearch, Postgres-with-an-API, and most modern
              SaaS (Stripe, Linear, Notion, Slack, GitHub) sit here. Every
              record has an id you can hand back to the agent, and the
              upstream API accepts arbitrary filters. Build the OpenSearch
              shape: small tools, one HTTP call each, identifiers in the
              return that the agent carries forward. There is no reason to
              keep state on the server, and adding state will only create bugs.
            </li>
            <li>
              <strong className="text-zinc-900">
                A surface with no public id and no API for individual users.
              </strong>{" "}
              WhatsApp consumer accounts, iMessage, Apple Notes, Things, Bear,
              and most native macOS apps sit here. The only handle on a record
              is its position in the UI right now. Build the WhatsApp shape:
              tools that explicitly say what UI state they leave open, return
              objects with positional indices, follow-up tools that consume
              those indices, and verification tools the agent can call to
              re-anchor before any write. State is unavoidable. The honest
              move is to admit it in the tool descriptions instead of
              pretending the server is stateless.
            </li>
            <li>
              <strong className="text-zinc-900">
                The mixed case, where the data is queryable but writes go
                through a UI.
              </strong>{" "}
              You can read messages over an API but only send via the desktop
              app, for example. Split the surface into two namespaces:
              stateless read tools that pass through the API, stateful write
              tools that drive the UI. Do not pretend the writes are
              stateless. The agent will assume any write tool is safe to call
              concurrently, and that assumption breaks the moment your write
              path is a click.
            </li>
          </ol>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What WhatsApp MCP would have to look like if WhatsApp shipped an
            OpenSearch
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            For the sake of the comparison, imagine WhatsApp consumer
            accounts exposed a per-user REST API that let you query messages
            and contacts by stable id, the way OpenSearch lets you query
            indices. The MCP server for it would collapse. The eleven tools
            in{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              main.swift
            </code>{" "}
            would shrink to about four:{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              search_chats
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              read_messages
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              send_message
            </code>
            , and a generic API passthrough. The two-call search-and-open
            handshake would disappear, because every chat would have a stable
            phone-number-keyed handle and{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              send_message
            </code>{" "}
            could just take that handle as an argument. Pagination would move
            to the API and become stateless. The whole accessibility-tree
            traversal would become dead code.
          </p>
          <p className="text-zinc-700 leading-relaxed mt-4">
            That is exactly what the OpenSearch MCP server gets to be. The
            data store does the work of giving every record a name. The MCP
            server&apos;s job is just to expose those names to the agent in a
            shape MCP hosts know how to consume. Anyone writing an MCP server
            against a real database (OpenSearch, Postgres, MongoDB,
            SingleStore, ClickHouse) is downstream of that gift. Anyone
            writing an MCP server against a desktop app is not.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            How both servers handle pagination
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Pagination is the cleanest place to see the design split. In
            OpenSearch MCP server, the agent decides how to paginate by
            choosing what to put in the request body. The classic pair{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              from
            </code>{" "}
            and{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              size
            </code>{" "}
            works for shallow pages. For deep pages,{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              search_after
            </code>{" "}
            gives the agent a sort cursor it can carry forward. Either way,
            the next page is a fresh, fully-formed call. The server has no
            opinion on what page you are on.
          </p>
          <p className="text-zinc-700 leading-relaxed mt-4">
            In WhatsApp MCP, the equivalent is{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_scroll_search
            </code>{" "}
            (defined at line 1059 in the same file). Because there is no
            offset parameter exposed by the WhatsApp app, the tool literally
            sends scroll-wheel events at the midpoint of the visible result
            buttons, sleeps briefly so the app can lazy-load, and then
            re-walks the AX tree to return the now-larger set. Calling it
            after the search has been closed does nothing useful. Calling it
            before the search has been opened returns an error. There is no
            stateless variant of this in the WhatsApp MCP. There cannot be.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Building an MCP server and not sure which shape it wants?"
          description="If your data source is queryable, copy OpenSearch. If it is a UI, you have a different problem. Happy to walk through your tool surface on a call."
          section="opensearch-mcp-server-footer"
        />

        <section className="max-w-3xl mx-auto px-6 my-16">
          <FaqSection items={faqItems} />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Talk through your MCP server design. 30 minutes, free."
          section="opensearch-mcp-server-sticky"
        />
      </article>
    </>
  );
}
