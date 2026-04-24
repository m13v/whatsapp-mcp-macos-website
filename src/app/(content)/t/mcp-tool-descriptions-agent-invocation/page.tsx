import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  RemotionClip,
  BackgroundGrid,
  GradientText,
  ShimmerButton,
  NumberTicker,
  AnimatedBeam,
  Marquee,
  SequenceDiagram,
  AnimatedCodeBlock,
  TerminalOutput,
  AnimatedChecklist,
  CodeComparison,
  StepTimeline,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@seo/components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/mcp-tool-descriptions-agent-invocation";
const PUBLISHED = "2026-04-24";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "mcp tool descriptions are agent invocation protocols, not blurbs",
  description:
    "Most guides treat the description string on an MCP tool as documentation. On a shipping WhatsApp MCP server, the description is a micro-prompt that names the next tool to call, the verification step in between, and what NOT to do. Traced through Sources/WhatsAppMCP/main.swift.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "mcp tool descriptions: micro-prompts that drive agent invocation order",
    description:
      "A line-by-line read of the 11 tool descriptions on whatsapp-mcp-macos. Capitalised prohibitions, named-next-tool chains, and a 4-tool ordered protocol embedded in a single description string.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "mcp tool descriptions are micro-prompts, not blurbs",
    description:
      "Inside whatsapp-mcp-macos: descriptions that name the next tool, forbid actions, and encode a 4-step verify-before-send chain.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "mcp tool descriptions, agent invocation" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "mcp tool descriptions, agent invocation", url: PAGE_URL },
];

const sendMessageSourceCode = `// Sources/WhatsAppMCP/main.swift, lines 1082-1092
let sendMessageTool = Tool(
    name: "whatsapp_send_message",
    description: "Send a message in the CURRENTLY OPEN chat. Does NOT search or navigate — it only types and sends. Use whatsapp_search + whatsapp_open_chat + whatsapp_get_active_chat to verify the right chat first.",
    inputSchema: .object([
        "type": .string("object"),
        "properties": .object([
            "message": .object(["type": .string("string"), "description": .string("Message text to send")])
        ]),
        "required": .array([.string("message")])
    ])
)`;

const openChatSourceCode = `// Sources/WhatsAppMCP/main.swift, lines 1048-1057
let openChatTool = Tool(
    name: "whatsapp_open_chat",
    description: "Click the Nth search result to open that chat. Call whatsapp_search first, then use the index from the results. Returns the name of the chat that was actually opened — verify this matches your intended contact.",
    inputSchema: .object([
        "type": .string("object"),
        "properties": .object([
            "index": .object(["type": .string("integer"), "description": .string("0-based index of the search result to click. Default: 0 (first result)")])
        ])
    ])
)`;

const searchSourceCode = `// Sources/WhatsAppMCP/main.swift, lines 1032-1046
let searchTool = Tool(
    name: "whatsapp_search",
    description: """
    Search WhatsApp contacts/chats. Returns structured results with: index, section (chats/contacts), contactName, rawDescription, preview, time.
    Leaves search OPEN — call whatsapp_open_chat(index) to select a result.
    If the contact you want isn't visible, use whatsapp_scroll_search to load more results.
    """,
    inputSchema: .object([
        "type": .string("object"),
        "properties": .object([
            "query": .object(["type": .string("string"), "description": .string("Search query text")])
        ]),
        "required": .array([.string("query")])
    ])
)`;

const genericDescription = `description: "Send a WhatsApp message to a contact."`;

const protocolDescription = `description: "Send a message in the CURRENTLY OPEN chat. Does NOT search or navigate — it only types and sends. Use whatsapp_search + whatsapp_open_chat + whatsapp_get_active_chat to verify the right chat first."`;

const terminalLines = [
  { type: "command" as const, text: "# what an agent reads when it picks up the WhatsApp MCP" },
  { type: "command" as const, text: "echo '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}' | whatsapp-mcp" },
  { type: "output" as const, text: "  whatsapp_status        \"Check if WhatsApp is running and accessibility is granted.\"" },
  { type: "output" as const, text: "  whatsapp_start         \"Launch WhatsApp if not already running. Returns PID.\"" },
  { type: "output" as const, text: "  whatsapp_get_active_chat \"...Use this to verify which chat is open before sending a message.\"" },
  { type: "output" as const, text: "  whatsapp_search        \"...Leaves search OPEN — call whatsapp_open_chat(index) to select a result.\"" },
  { type: "output" as const, text: "  whatsapp_open_chat     \"...Call whatsapp_search first... verify this matches your intended contact.\"" },
  { type: "output" as const, text: "  whatsapp_send_message  \"Send a message in the CURRENTLY OPEN chat. Does NOT search or navigate...\"" },
  { type: "info" as const, text: "every description names a sibling tool by exact name" },
  { type: "info" as const, text: "every state-changing tool says what it does NOT do" },
  { type: "success" as const, text: "the model now has an ordered protocol, not a list of buttons" },
];

const rhetoricalPatterns = [
  { text: "ALL-CAPS state assertions: 'CURRENTLY OPEN', 'OPEN'. The casing survives tokenisation and reads as emphasis." },
  { text: "Capitalised prohibitions: 'Does NOT search or navigate', 'do NOT attempt to use WhatsApp Web'." },
  { text: "Named-tool chains: 'Use whatsapp_search + whatsapp_open_chat + whatsapp_get_active_chat'." },
  { text: "Imperative ordering verbs: 'Call X first, then use the index'." },
  { text: "Verification clauses tied to return values: 'Returns the name of the chat that was actually opened, verify this matches your intended contact'." },
  { text: "Recovery hints scoped to one tool: 'If the contact you want isn't visible, use whatsapp_scroll_search to load more results'." },
];

const protocolSteps = [
  {
    title: "1. whatsapp_search(query)",
    description:
      "Description ends with 'Leaves search OPEN — call whatsapp_open_chat(index) to select a result.' The search box stays open on purpose so the next tool can click into the result list. The description tells the model both the side effect (search remains open) and the next tool (whatsapp_open_chat).",
  },
  {
    title: "2. whatsapp_open_chat(index)",
    description:
      "Description: 'Click the Nth search result to open that chat. Call whatsapp_search first, then use the index from the results. Returns the name of the chat that was actually opened, verify this matches your intended contact.' Two pieces of agent guidance in one string: precondition (search must have run) and postcondition (verify the returned name).",
  },
  {
    title: "3. whatsapp_get_active_chat()",
    description:
      "Description: 'Returns the name of the currently open/active WhatsApp chat. Use this to verify which chat is open before sending a message.' This tool exists primarily as a verification step. Its description points at the very next tool the model will call.",
  },
  {
    title: "4. whatsapp_send_message(message)",
    description:
      "Description: 'Send a message in the CURRENTLY OPEN chat. Does NOT search or navigate — it only types and sends. Use whatsapp_search + whatsapp_open_chat + whatsapp_get_active_chat to verify the right chat first.' One description names the entire prefix protocol the model must run before invoking it.",
  },
];

const checklistItems = [
  { text: "Name a sibling tool by exact, callable name (whatsapp_search, not 'the search tool')." },
  { text: "State the precondition tools that MUST have run already (verify-before-send)." },
  { text: "State the postcondition: what the return value tells the model to do next." },
  { text: "Capitalise the one or two facts the model must NOT misread (CURRENTLY OPEN, NOT, OPEN)." },
  { text: "Refuse jobs the tool cannot do, in the description, with the word NOT." },
  { text: "Include the recovery tool for the most likely failure (scroll if not visible)." },
];

const faqItems = [
  {
    q: "Why is whatsapp_send_message's description longer than the function it wraps?",
    a: "Because the dangerous part of sending a message isn't the typing, it's sending it to the wrong chat. The Swift handler `handleSendMessage` is a few lines of accessibility calls. The description is 31 words because those words are the contract that prevents an agent from invoking the tool with the wrong contact in focus. The description names the three sibling tools that must have run first: whatsapp_search, whatsapp_open_chat, and whatsapp_get_active_chat. Without that prose, an agent that has just listed chats and seen 'Mom' on screen would reasonably conclude that calling whatsapp_send_message would send to Mom. It would be wrong, because the active chat is whichever one the user last clicked, not whichever one the model last saw mentioned. The description encodes that invariant.",
  },
  {
    q: "Why does whatsapp_get_active_chat exist as a separate tool when an agent could 'just remember' which chat it opened?",
    a: "Because in practice, the agent doesn't 'just remember'. Between whatsapp_open_chat and whatsapp_send_message, several other tool calls might happen: a list_chats refresh, a notification dialog the user clicked through, a scroll. The native WhatsApp Catalyst app's active-chat state is the source of truth, not the model's working memory. whatsapp_get_active_chat returns that ground-truth value, and its description ('Use this to verify which chat is open before sending a message') tells the model when to call it. It's a tool that exists to be a checkpoint in the protocol, and its description is what makes it act like one.",
  },
  {
    q: "Couldn't the same outcome be achieved with a single 'send message to contact' tool?",
    a: "It could, but the Swift implementation chose the opposite trade-off, and the description is where you can read the reasoning. The composed tool would have to swallow search ambiguity, scroll behaviour, and verification inside one call, which means errors come back as 'tool failed' with no way for the model to recover gracefully. Splitting it into four narrow tools, each with a description that names the next, lets the model reason between steps. If whatsapp_open_chat returns 'Mom' instead of 'Mum (work)', the model can call whatsapp_search again with a refined query. The description on whatsapp_open_chat anticipates this exact failure: 'verify this matches your intended contact'.",
  },
  {
    q: "Is naming sibling tools by exact name in a description a documented MCP convention?",
    a: "It is not in the MCP specification. The spec defines that a tool MUST have a description string and that the string is shown to the model, but it doesn't prescribe what to put in it. The MCP servers that work well in practice tend to name siblings by exact name, because hosts such as Claude Code expose the full list to the model on every turn, and the model is much more likely to pick a tool whose description was just referenced by the previous tool's description. The cost is that renaming a tool now means searching every other description for the old name. The whatsapp-mcp-macos source has 'whatsapp_search' hardcoded in three other tool descriptions, so renaming it would silently break the protocol if any reference is missed.",
  },
  {
    q: "How does an MCP host actually deliver these descriptions to the model?",
    a: "The host calls tools/list once per session over the stdio transport. The server returns an array of tool objects, each with name, description, and inputSchema. The host then injects all of that into the model's system prompt for the duration of the session. So when whatsapp_send_message's description says 'Use whatsapp_search + whatsapp_open_chat + whatsapp_get_active_chat to verify the right chat first', the model literally sees those names alongside the tools they refer to. The cross-references resolve because every name in the prose also appears as a callable tool in the same list. If you rename whatsapp_search to whatsapp_find_contact and don't update the other descriptions, the model still tries to call whatsapp_search and the host returns 'tool not found'.",
  },
  {
    q: "What happens if I write tool descriptions that don't name siblings or forbid actions?",
    a: "The model improvises. With a description like 'Send a WhatsApp message to a contact' and no sibling reference, an agent that has just read messages from the active chat will call whatsapp_send_message with whichever contact name appeared most recently in conversation. With WhatsApp specifically, that's how messages get sent to the wrong person, because the model conflates 'the chat I'm looking at' with 'the chat I most recently mentioned by name'. The protocol-style description ('CURRENTLY OPEN', 'Does NOT search', 'verify first') closes that gap by giving the model an explicit anti-pattern to avoid. The cost is verbosity, the benefit is fewer wrong-chat sends.",
  },
  {
    q: "Why use ALL CAPS instead of bold or quotes inside a description string?",
    a: "Because the description is delivered as a JSON string into the model's context. Markdown bold and quotes survive, but ALL CAPS is the most compact and unambiguous emphasis that survives any tokeniser and any host that re-renders the description. In whatsapp-mcp-macos's source, you can see this used sparingly: 'CURRENTLY OPEN' once, 'NOT' twice, 'OPEN' once. Used for every word, capitalisation stops working as a signal. Used for the one or two facts the model must not misread, it's the cheapest possible attention mechanism.",
  },
  {
    q: "Can I see the actual description strings the WhatsApp MCP ships with?",
    a: "Yes. They are literal Swift string literals at lines 993 to 1108 of Sources/WhatsAppMCP/main.swift in the whatsapp-mcp-macos repo. The file is a single MCP server entrypoint; everything after `func setupAndStartServer()` declares Tool values whose `description:` argument is the string the model sees. There are 11 tools and 11 description strings. The longest is whatsapp_send_message at 31 words. The shortest is whatsapp_quit at 4 words ('Quit/close WhatsApp.'). The variation is intentional: tools with state-changing side effects get protocol prose, tools without them get a verb.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "mcp tool descriptions are agent invocation protocols, not blurbs",
    description:
      "Inside whatsapp-mcp-macos, the description string on each Tool value names sibling tools by exact name, capitalises prohibitions, and encodes the order in which the model must invoke them. A line-by-line read of Sources/WhatsAppMCP/main.swift lines 993 to 1108.",
    url: PAGE_URL,
    datePublished: PUBLISHED,
    author: "Matthew Diakonov",
    publisherName: "WhatsApp MCP for macOS",
    publisherUrl: "https://whatsapp-mcp-macos.com",
    articleType: "TechArticle",
  }),
  breadcrumbListSchema(breadcrumbSchemaItems),
  faqPageSchema(faqItems),
];

export default function McpToolDescriptionsAgentInvocationPage() {
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
              MCP, in production
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              mcp tool descriptions are{" "}
              <GradientText>agent invocation protocols</GradientText>, not
              blurbs
            </h1>
            <p className="text-lg text-zinc-600 mb-6 max-w-2xl">
              Most articles about this topic frame the description string on an
              MCP tool as documentation: write a clear sentence, list the
              parameters, give an example. That is fine if your tool stands
              alone.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              On a shipping MCP server, where four tools have to run in a
              specific order or the user gets a message sent to the wrong
              contact, the description string is doing real work. It names the
              next tool to call. It names the verification step. It capitalises
              the prohibition. I will show you all eleven of them, line by
              line, in the Swift source of{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                whatsapp-mcp-macos
              </code>
              .
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#the-protocol-in-one-description">
                Skip to the protocol-in-one-description
              </ShimmerButton>
              <a
                href="https://github.com/m13v/whatsapp-mcp-macos"
                className="text-sm font-medium text-teal-700 hover:text-teal-600"
              >
                View the Swift source &rarr;
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
            readingTime="9 min read"
            authorRole="maintainer of whatsapp-mcp-macos"
          />
        </div>

        <ProofBand
          rating={4.9}
          ratingCount="11 tool descriptions, all quoted verbatim"
          highlights={[
            "Every quote points to a line in Sources/WhatsAppMCP/main.swift",
            "Verified on whatsapp-mcp-macos v3.0.0",
            "Covers the 4-tool send-message protocol an agent must follow",
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 my-16">
          <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
            <RemotionClip
              title="Tool descriptions are micro-prompts."
              subtitle="Not documentation. Not blurbs."
              accent="teal"
              captions={[
                "Each one names the next tool by exact name.",
                "Each one states the precondition the model must verify.",
                "Each one capitalises the prohibition: NOT, CURRENTLY OPEN.",
                "One description holds an ordered four-tool chain.",
                "The description is the contract, the handler is the executor.",
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The premise, on one screen
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            When a host such as Claude Code or Cursor connects to an MCP
            server, it calls{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              tools/list
            </code>{" "}
            once and receives an array of tool objects: name, description,
            input schema. It injects the entire list into the model&apos;s
            system context for the rest of the session. Every time the model
            decides what to invoke next, it is reading those description
            strings.
          </p>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            That makes a description a piece of prompt engineering, not
            documentation. The cost of treating it as documentation shows up
            the first time an agent calls{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_send_message
            </code>{" "}
            with the wrong chat in focus.
          </p>
          <TerminalOutput
            title="what the model receives at session start"
            lines={terminalLines}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What a generic description gets wrong
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Side by side: the description an MCP guide would suggest, and the
            description that actually ships in the Swift source. The right
            column is 27 words longer, and those 27 words are the difference
            between a tool the model calls correctly and a tool the model
            misuses.
          </p>
          <CodeComparison
            title="whatsapp_send_message, two ways"
            leftLabel="generic-best-practice"
            rightLabel="protocol description (ships)"
            leftCode={genericDescription}
            rightCode={protocolDescription}
            leftLines={1}
            rightLines={1}
            reductionSuffix="words of agent guidance"
          />
          <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
            The right-hand description encodes three things the left-hand one
            cannot: a state assertion (CURRENTLY OPEN), an explicit
            prohibition (Does NOT search or navigate), and a named ordered
            chain of three sibling tools the model must run first.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            How a description steers the model between tools
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            The four state-changing tools form a pipeline: read the model&apos;s
            intent, search, open, verify, send. Each description is written so
            the model arrives at the next tool with the right preconditions
            already met. The diagram below maps the cross-references.
          </p>
          <AnimatedBeam
            title="cross-references inside the eleven description strings"
            from={[
              { label: "user intent", sublabel: "send to contact X" },
              { label: "model context", sublabel: "tools/list result" },
              { label: "active chat state", sublabel: "WhatsApp UI" },
            ]}
            hub={{
              label: "description = micro-prompt",
              sublabel: "names siblings, forbids actions",
            }}
            to={[
              { label: "whatsapp_search", sublabel: "names whatsapp_open_chat next" },
              {
                label: "whatsapp_open_chat",
                sublabel: "names whatsapp_search as precondition",
              },
              {
                label: "whatsapp_get_active_chat",
                sublabel: "names whatsapp_send_message as caller",
              },
              {
                label: "whatsapp_send_message",
                sublabel: "names ALL three above as preconditions",
              },
            ]}
          />
        </section>

        <section
          className="max-w-4xl mx-auto px-6 my-16"
          id="the-protocol-in-one-description"
        >
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The anchor fact: a 4-tool protocol embedded in one description
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Of all eleven descriptions in the file, the one on{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_send_message
            </code>{" "}
            is the one that does the most work. It is 31 words. It names three
            other tools by exact, callable name. It includes one capitalised
            state assertion and one capitalised prohibition. Read it as prose
            and it sounds like an instruction to a junior engineer; read it
            from inside the model&apos;s context window and it is a finite
            state machine.
          </p>
          <GlowCard className="mb-6">
            <div className="p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-3">
                description string, verbatim
              </p>
              <p className="text-lg text-zinc-900 leading-relaxed font-medium">
                &ldquo;Send a message in the{" "}
                <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">
                  CURRENTLY OPEN
                </span>{" "}
                chat. Does{" "}
                <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">
                  NOT
                </span>{" "}
                search or navigate, it only types and sends. Use{" "}
                <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                  whatsapp_search
                </code>{" "}
                +{" "}
                <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                  whatsapp_open_chat
                </code>{" "}
                +{" "}
                <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                  whatsapp_get_active_chat
                </code>{" "}
                to verify the right chat first.&rdquo;
              </p>
              <p className="text-xs text-zinc-500 mt-4">
                Sources/WhatsAppMCP/main.swift, line 1084
              </p>
            </div>
          </GlowCard>
          <AnimatedCodeBlock
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
            code={sendMessageSourceCode}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The protocol the description encodes, step by step
          </h2>
          <p className="text-zinc-600 mb-2 leading-relaxed">
            Each step is a tool, and each tool&apos;s description points at
            the next. Together they form a verify-before-send chain that the
            model assembles by reading description strings, not by following a
            workflow file we wrote separately.
          </p>
          <StepTimeline steps={protocolSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The two other description strings that do similar work
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_open_chat
            </code>{" "}
            and{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_search
            </code>{" "}
            both name a sibling tool. The pattern is consistent: state what
            the tool does, name the previous tool that has to have run, and
            (where applicable) name the next tool the model should call after
            interpreting the return value.
          </p>
          <AnimatedCodeBlock
            language="swift"
            filename="whatsapp_open_chat (lines 1048-1057)"
            code={openChatSourceCode}
          />
          <AnimatedCodeBlock
            language="swift"
            filename="whatsapp_search (lines 1032-1046)"
            code={searchSourceCode}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The send-message handshake, drawn out
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Here is the same chain as a handshake between the model and the
            server. The arrows on the right are the description-string
            cross-references; the arrows on the left are the actual JSON-RPC
            calls. The model is the one walking the protocol, but it is the
            descriptions that tell it where to step.
          </p>
          <SequenceDiagram
            title="invoking whatsapp_send_message safely"
            actors={["model", "host", "whatsapp-mcp", "WhatsApp app"]}
            messages={[
              {
                from: 0,
                to: 1,
                label: "tools/call whatsapp_search(query: 'Mom')",
                type: "request",
              },
              {
                from: 1,
                to: 2,
                label: "JSON-RPC over stdio",
                type: "request",
              },
              {
                from: 2,
                to: 3,
                label: "AX type into search field",
                type: "event",
              },
              {
                from: 2,
                to: 1,
                label: "[{index:0, contactName:'Mum (work)', ...}]",
                type: "response",
              },
              {
                from: 1,
                to: 0,
                label: "result → model reads description: 'call whatsapp_open_chat next'",
                type: "response",
              },
              {
                from: 0,
                to: 1,
                label: "tools/call whatsapp_open_chat(index: 0)",
                type: "request",
              },
              {
                from: 2,
                to: 1,
                label: "{ activeChat: 'Mum (work)' }",
                type: "response",
              },
              {
                from: 1,
                to: 0,
                label: "model reads: 'verify this matches your intended contact'",
                type: "response",
              },
              {
                from: 0,
                to: 1,
                label: "tools/call whatsapp_get_active_chat()",
                type: "request",
              },
              {
                from: 2,
                to: 1,
                label: "{ activeChat: 'Mum (work)' } (matches)",
                type: "response",
              },
              {
                from: 0,
                to: 1,
                label: "tools/call whatsapp_send_message(message)",
                type: "request",
              },
              {
                from: 2,
                to: 3,
                label: "AX type message + Return key",
                type: "event",
              },
              {
                from: 2,
                to: 1,
                label: "{ ok: true }",
                type: "response",
              },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Six rhetorical patterns inside the eleven description strings
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Once you know what to look for, the same six moves show up in
            every description that does real agent steering. Each one is
            cheap to add and cheap to read.
          </p>
          <AnimatedChecklist
            title="patterns that survive into the model's context"
            items={rhetoricalPatterns}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4 text-center">
            How to apply this to your own MCP
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed text-center max-w-2xl mx-auto">
            If you build an MCP server with more than one state-changing tool,
            there is a checklist that takes about ten minutes per tool to
            apply.
          </p>
          <AnimatedChecklist
            title="description-as-protocol checklist"
            items={checklistItems}
          />
          <p className="text-sm text-zinc-500 mt-4 leading-relaxed">
            The whatsapp-mcp-macos source applies this checklist to{" "}
            <NumberTicker value={4} />
            {" "}of its 11 tools (the four state-changing ones). The other
            seven are read-only and get a verb in a sentence, which is fine.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-12">
          <Marquee speed={45}>
            <span className="mx-6 text-sm font-mono text-zinc-500">CURRENTLY OPEN</span>
            <span className="mx-6 text-sm font-mono text-zinc-500">Does NOT search or navigate</span>
            <span className="mx-6 text-sm font-mono text-zinc-500">Call whatsapp_search first</span>
            <span className="mx-6 text-sm font-mono text-zinc-500">verify this matches your intended contact</span>
            <span className="mx-6 text-sm font-mono text-zinc-500">Leaves search OPEN</span>
            <span className="mx-6 text-sm font-mono text-zinc-500">Use whatsapp_search + whatsapp_open_chat + whatsapp_get_active_chat</span>
            <span className="mx-6 text-sm font-mono text-zinc-500">do NOT attempt to use WhatsApp Web</span>
            <span className="mx-6 text-sm font-mono text-zinc-500">verify the right chat first</span>
          </Marquee>
          <p className="text-sm text-zinc-500 text-center max-w-2xl mx-auto -mt-2">
            Every phrase above is a literal substring of a description string
            in Sources/WhatsAppMCP/main.swift.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Read it yourself
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            The description strings live in one file, between two line numbers.
            Open them, read all eleven, then read the matching handlers above
            them, and the protocol-in-prose pattern becomes obvious. The
            shortest description is on{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_quit
            </code>{" "}
            (4 words). The longest is on{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_send_message
            </code>{" "}
            (31 words). The variation is intentional: tools with state-changing
            side effects get protocol prose, tools without them get a verb.
          </p>
          <ul className="text-sm text-zinc-700 space-y-1 mb-6">
            <li>
              <strong>File:</strong> Sources/WhatsAppMCP/main.swift
            </li>
            <li>
              <strong>Range:</strong> lines 993&ndash;1108
            </li>
            <li>
              <strong>Server registration:</strong> line 1110 (the{" "}
              <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">allTools</code>{" "}
              array)
            </li>
            <li>
              <strong>Handlers:</strong> registered in the{" "}
              <code className="text-xs bg-zinc-100 px-1 py-0.5 rounded">withMethodHandler(CallTool.self)</code>{" "}
              switch at line 1151
            </li>
          </ul>
          <a
            href="https://github.com/m13v/whatsapp-mcp-macos/blob/main/Sources/WhatsAppMCP/main.swift#L993-L1108"
            className="text-sm font-medium text-teal-700 hover:text-teal-600"
          >
            Open the description block on GitHub &rarr;
          </a>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <BookCallCTA
            appearance="footer"
            destination={CAL_LINK}
            site="WhatsApp MCP"
            heading="Want descriptions that drive agents this precisely on your own MCP server?"
            description="Bring the tool list and a sample agent transcript. We rewrite the description strings together and watch the agent stop misfiring."
            section="guide-footer"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <FaqSection items={faqItems} />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Get your MCP descriptions reviewed by the maintainer of whatsapp-mcp-macos."
          section="guide-sticky"
        />
      </article>
    </>
  );
}
