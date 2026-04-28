import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  RemotionClip,
  BackgroundGrid,
  GradientText,
  ShimmerButton,
  NumberTicker,
  AnimatedBeam,
  SequenceDiagram,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  GlowCard,
  ComparisonTable,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL = "https://whatsapp-mcp-macos.com/t/stripe-mcp-server";
const PUBLISHED = "2026-04-27";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "Stripe MCP server: it creates the payment link. It does not deliver it.",
  description:
    "Stripe MCP returns plink_xxx, cust_xxx, in_xxx identifiers but ships zero outbound delivery. Pair it with WhatsApp MCP and the same agent that mints the link confirms the customer actually received it, verified against the WhatsApp accessibility tree.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Stripe MCP server has no delivery channel. Here is the missing half.",
    description:
      "Every guide on Stripe MCP stops at create_payment_link. The agent flow stalls there, because Stripe MCP cannot send the URL to a customer. WhatsApp MCP closes that loop with a verified send through the desktop app, no Business API fees.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The half of Stripe MCP nobody covers: getting the link to the customer",
    description:
      "Stripe MCP creates the financial object. WhatsApp MCP delivers the receipt and verifies it via the AX tree. One config, two child processes, one agent.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Stripe MCP server" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "Stripe MCP server", url: PAGE_URL },
];

const mergedConfigCode = `{
  "mcpServers": {
    "stripe": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@stripe/mcp", "--tools=all", "--api-key=sk_live_..."],
      "env": {}
    },
    "whatsapp": {
      "type": "stdio",
      "command": "whatsapp-mcp",
      "args": [],
      "env": {}
    }
  }
}`;

const verificationCode = `// Sources/WhatsAppMCP/main.swift, line 923 onward
// Post-send verification: check if last message in chat matches what we sent
let postElements = traverseAXTree(pid: pid)
let genericElements = findElements(in: postElements, role: "AXGenericElement")

var lastSentMessage: String? = nil
for el in genericElements {
    let desc = cleanUnicode(el.description ?? "")
    if desc.hasPrefix("Your message, ") {       // line 930
        // Extract just the message text, strip the trailing timestamp
        let rest = String(desc.dropFirst("Your message, ".count))
        var text = rest
        if let timeRange = text.range(of: #",\\s+\\d{1,2}:\\d{2}\\s*[APap][Mm]"#,
                                      options: .regularExpression) {
            text = String(text[text.startIndex..<timeRange.lowerBound])
        }
        lastSentMessage = text.trimmingCharacters(in: CharacterSet(charactersIn: ", "))
    }
}`;

const stripeReturnCode = `// what stripe MCP gives the agent back
{
  "id": "plink_1Q2eR0Lk...",
  "object": "payment_link",
  "active": true,
  "url": "https://buy.stripe.com/test_5kAfZh7n...",
  "currency": "usd",
  "line_items": [...],
  "metadata": {}
}
// the agent now holds a URL.
// the agent has no way to put that URL in front of a human.`;

const terminalLines = [
  { type: "command" as const, text: "# the agent owns one merged session, two MCP children" },
  { type: "command" as const, text: "ps -o pid,ppid,command -p $(pgrep -f 'stripe.*mcp\\|whatsapp-mcp')" },
  { type: "output" as const, text: "62103  41250  /usr/local/bin/node /.../@stripe/mcp/dist/index.js" },
  { type: "output" as const, text: "62104  41250  /.../whatsapp-mcp" },
  { type: "command" as const, text: "# both processes are children of the same host (pid 41250)" },
  { type: "command" as const, text: "# the agent issues the calls in order:" },
  { type: "command" as const, text: 'tools/call create_payment_link  amount=4900 currency=usd' },
  { type: "output" as const, text: '{"id":"plink_1Q...","url":"https://buy.stripe.com/test_5kA..."}' },
  { type: "command" as const, text: 'tools/call whatsapp_search       query="Acme Coffee"' },
  { type: "output" as const, text: '[{"index":0,"name":"Acme Coffee","preview":"...","section":"Chats"}]' },
  { type: "command" as const, text: 'tools/call whatsapp_open_chat    index=0' },
  { type: "output" as const, text: '{"active":"Acme Coffee"}' },
  { type: "command" as const, text: 'tools/call whatsapp_send_message message="Invoice $49: https://buy.stripe.com/test_5kA..."' },
  { type: "success" as const, text: '{"success":true,"verified":true,"to":"Acme Coffee","message":"Invoice $49: https://buy.stripe.com/test_5kA..."}' },
  { type: "command" as const, text: "# verified:true means the bubble was found in the AX tree post-send." },
];

const walkthroughSteps = [
  {
    title: "1. The agent calls create_payment_link on the Stripe MCP child",
    description:
      "The Stripe MCP server speaks JSON-RPC over stdio just like every other MCP server. The agent invokes tools/call with method create_payment_link, line items, and a metadata object. Stripe returns a payment_link object whose url field is the customer-facing URL.",
  },
  {
    title: "2. The agent has a URL but no audience",
    description:
      "Stripe MCP's surface ends here. There is no send_link_via_email, no post_to_sms, no notify_customer. The MCP toolset mutates Stripe state. It does not put pixels in front of a human. If the agent stops here, the URL exists in chat history and nowhere else.",
  },
  {
    title: "3. The agent calls whatsapp_search on the second MCP child",
    description:
      "Same host, different child process. The agent passes the customer's name (or phone number) to whatsapp_search, which drives the macOS WhatsApp app, types into the search field, and reads the result list back through the accessibility tree. The result is an indexed array: [{ index: 0, name, preview, section }].",
  },
  {
    title: "4. The agent opens the chat and sends the link",
    description:
      "whatsapp_open_chat clicks the indexed result. whatsapp_send_message pastes the message via the clipboard (Cmd+V) and presses Return. The agent's prompt now contains the full Stripe URL plus whatever language fits the relationship.",
  },
  {
    title: "5. The agent verifies delivery against the AX tree",
    description:
      "After the keypress, whatsapp_send_message re-walks the accessibility tree, finds AXGenericElement nodes whose description begins with the prefix 'Your message, ', strips the timestamp, and compares the result to the sent text. Match returns verified:true. No match returns verified:false with the last sent bubble in the warning field. This is the single observation Stripe MCP cannot produce on its own.",
  },
];

const compareRows = [
  {
    feature: "Per-conversation cost to send a payment link",
    competitor: "$0.005 to $0.15 (region-dependent template fees)",
    ours: "$0, the desktop app sends through your existing account",
  },
  {
    feature: "Provisioning time before the agent can send",
    competitor: "Business verification, phone number approval, template review",
    ours: "Open WhatsApp on macOS, grant Accessibility, install the MCP",
  },
  {
    feature: "Delivery confirmation surface",
    competitor: "Webhooks (sent / delivered / read) on a separate endpoint",
    ours: "Re-read of the AX tree inside the same tools/call response",
  },
  {
    feature: "Templates required for outbound",
    competitor: "Pre-approved HSM templates for any business-initiated send",
    ours: "Free-form text typed straight into the compose field",
  },
  {
    feature: "Phone number reuse",
    competitor: "Number must be migrated to the Business platform",
    ours: "Same number you already use, unchanged",
  },
  {
    feature: "Where the link lives after send",
    competitor: "On Meta's servers plus your audit pipeline",
    ours: "In your real WhatsApp chat, scrollable like any other message",
  },
];

const faqItems = [
  {
    q: "Does Stripe ship a built-in way to send a payment link to a customer?",
    a: "No. The Stripe MCP server exposes tools across customers, payment links, payment intents, invoices, refunds, billing, and a docs search. Every tool either reads or mutates Stripe state. The closest delivery primitive is invoice.send, which uses the customer's email if one is on file, but that is an email channel and the agent has no observation of whether the message arrived. There is no SMS, no WhatsApp, no push channel inside Stripe MCP, so an agent that wants to put a payment link in front of a human has to call a second MCP server.",
  },
  {
    q: "Why pair Stripe MCP with WhatsApp specifically?",
    a: "Two reasons. First, WhatsApp is where most small-business commerce already happens outside the US (Brazil, India, Mexico, MENA, Southeast Asia), so the customer is already in the inbox. Second, with the macOS-driven WhatsApp MCP you can send through your existing personal or business WhatsApp account without paying the $0.005-$0.15 conversation fee Meta charges for templated messages on the WhatsApp Business API. The agent's payment-link send becomes a free, free-form, verified message instead of a billable templated one.",
  },
  {
    q: "Both Stripe MCP and WhatsApp MCP are stdio servers. Can the same host run both at once?",
    a: "Yes. An MCP host (Claude Code, Cursor, Claude Desktop) reads a JSON config that maps server names to launch commands. Each entry becomes a separate child process. With the merged config shown above the host forks two children: one running npx -y @stripe/mcp, one running the whatsapp-mcp binary. Both speak JSON-RPC over their own stdio pipes back to the same parent. The agent then sees the union of the two tool surfaces in a single tools/list result.",
  },
  {
    q: "What does verified delivery actually mean here?",
    a: "After whatsapp_send_message presses Return, the WhatsApp MCP child sleeps 1.0 seconds and re-traverses the WhatsApp app's accessibility tree (Sources/WhatsAppMCP/main.swift, line 924). It collects every AXGenericElement, looks for descriptions that begin with the literal string 'Your message, ', strips the timestamp suffix with a regex, and compares the resulting text against what the agent asked to send. If it matches, the JSON response carries verified:true. If not, it returns verified:false plus the last bubble it could find in the warning field. The verification is observation of the rendered chat, not a delivery webhook.",
  },
  {
    q: "Will the verified send still go through if the customer has the WhatsApp Business API on their number?",
    a: "Yes. The desktop driver does not care which side of the conversation is on the Business platform. From the WhatsApp app's perspective the message is just an outbound chat from your account. The Business API's pricing applies to the side that is using the cloud API for sends, which is not what this setup does. You are sending as a regular user, with the regular per-account daily volume limits WhatsApp applies to any account.",
  },
  {
    q: "What happens when Stripe webhooks fire (payment succeeded, invoice paid)?",
    a: "Stripe MCP itself does not subscribe to webhooks; it only exposes synchronous tool calls. To act on a webhook you wire your existing Stripe webhook endpoint to drop the event into a queue or a file, and run the agent on a tick that reads that queue. Once the agent picks up an invoice.paid event it calls whatsapp_search to find the customer and whatsapp_send_message to send the thank-you. Same pair of tools, triggered by an asynchronous event instead of a synchronous user prompt.",
  },
  {
    q: "Can I use the Stripe-hosted remote server (mcp.stripe.com) instead of the local stdio one?",
    a: "Yes for the Stripe half. The remote server uses HTTP transport with OAuth, so the host opens a connection rather than forking a child. The pairing with WhatsApp MCP is unchanged: WhatsApp MCP still has to run as a stdio child on macOS because it drives a local app via accessibility APIs. Mixed transports in one host is fine, the host treats each server independently. The trade-off is convenience (no API key in your config) versus latency and the loss of fully-local execution.",
  },
  {
    q: "If Stripe MCP can already create a customer with an email, why do I need WhatsApp at all?",
    a: "You only need WhatsApp if the customer prefers WhatsApp to email, which is overwhelmingly the case in markets where WhatsApp is the default chat surface. For a US SaaS with a clean email channel, Stripe MCP plus invoice.send is enough. For a Brazilian gym, an Indian tutor, an Egyptian e-commerce merchant, the customer never opens email and the payment-link URL has to land in WhatsApp to convert. The pair exists for the second case.",
  },
  {
    q: "What about the security of running a Stripe secret key inside a stdio MCP child?",
    a: "Treat the local Stripe MCP the same way you treat your CLI. The api-key arg is materialized in the host's process list and any process inheriting the host's environment can see it. For higher-stakes use, prefer the remote OAuth-backed server, or run npx -y @stripe/mcp with a restricted-scope key (read-only or limited to a specific resource family) instead of your live secret key. The same guidance applies to any Stripe-related tool the agent can call.",
  },
  {
    q: "How do I debug when the agent says verified:false?",
    a: "Three common cases. One, the chat scrolled before the post-send walk completed and the new bubble is offscreen; the AX tree only contains visible nodes, so a hidden message returns verified:false even though it was sent. Two, the message contains an emoji or character whose AX description normalizes differently from the typed text; the comparison is case-folded and prefix-tolerant but not unicode-perfect. Three, the active chat changed between paste and re-walk; whatsapp_get_active_chat after the failed send tells you which chat the bubble actually landed in. In all three cases the message did get sent; the verification is what missed.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "Stripe MCP server: it creates the payment link, but it does not deliver it",
    description:
      "Stripe MCP exposes tools that create and mutate Stripe objects. It returns identifiers like plink_xxx, cust_xxx, in_xxx but ships zero outbound delivery channels. Pair it with WhatsApp MCP for macOS and the same agent that mints a payment link confirms the customer received it, verified against the desktop app's accessibility tree.",
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

export default function StripeMcpServerPage() {
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
              Stripe MCP, the missing half
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              Stripe MCP server creates the payment link.{" "}
              <GradientText>It does not deliver it.</GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-6 max-w-2xl">
              Every walkthrough of Stripe&apos;s MCP server stops at the moment the
              agent gets a <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">payment_link.url</code>{" "}
              back. The agent now owns a URL. It owns no audience. There is no
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800 ml-1">send_link_via_sms</code>,
              no <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">post_to_whatsapp</code>,
              no delivery primitive at all.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              The natural pair, on macOS, is a second MCP child that drives the
              WhatsApp desktop app through accessibility APIs. The same agent
              creates the link, sends it, and verifies the bubble appeared in the
              chat, all in one tools/call sequence. No WhatsApp Business API fees,
              no template approvals, no separate webhook plumbing for delivery.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#walkthrough">
                See the merged flow
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
            readingTime="9 min read"
            author="Matthew Diakonov"
            authorRole="Written with AI"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
            <RemotionClip
              title="Stripe MCP makes the receipt."
              subtitle="WhatsApp MCP is what hands it to the customer."
              accent="teal"
              captions={[
                "Agent calls create_payment_link, gets a URL back.",
                "Stripe MCP has no outbound channel. Flow stalls.",
                "Second MCP child drives the WhatsApp desktop app.",
                "Send the link, then re-read the accessibility tree.",
                "Bubble found. verified:true. The loop closed.",
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What the Stripe MCP tool returns, and what it does not
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            When the agent calls{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              tools/call create_payment_link
            </code>{" "}
            on the Stripe MCP child, the response is a JSON object that mirrors the
            REST API response. The interesting field for an agent is{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              url
            </code>
            . Everything else is metadata.
          </p>
          <AnimatedCodeBlock
            code={stripeReturnCode}
            language="json"
            filename="tools/call create_payment_link, response"
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            The response is correct, complete, and useless on its own. The agent
            now has to put that URL in front of a human, and the Stripe MCP
            surface ends here. Email is the implicit assumption in most guides,
            but it is not a primitive Stripe MCP exposes; it is something you
            either chain a second tool to do, or accept that the agent will print
            the URL into its own response and wait for a person to copy it.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Two MCP children, one host, one merged tool surface
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            An MCP host reads a config that maps server names to launch commands.
            Each entry becomes a separate child process speaking JSON-RPC over
            its own stdio pipes. With both servers wired up the agent sees the
            union of their tools and can chain them in a single turn.
          </p>
          <AnimatedBeam
            title="one host, two MCP children, one chain of tool calls"
            from={[
              { label: "create_payment_link", sublabel: "Stripe MCP tool" },
              { label: "create_invoice", sublabel: "Stripe MCP tool" },
              { label: "create_refund", sublabel: "Stripe MCP tool" },
            ]}
            hub={{ label: "host (Claude / Cursor)", sublabel: "agent loop" }}
            to={[
              { label: "whatsapp_search", sublabel: "WhatsApp MCP tool" },
              { label: "whatsapp_send_message", sublabel: "verified send" },
              { label: "whatsapp_read_messages", sublabel: "follow-up read" },
            ]}
          />
          <p className="text-sm text-zinc-500 mt-4 text-center max-w-2xl mx-auto">
            The Stripe child mints the financial object. The WhatsApp child owns
            delivery. Neither knows about the other. The agent is the only
            integrator.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            The merged config: both servers in one ~/.claude.json entry
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Both servers are stdio. The host forks one process per entry. Stripe
            MCP runs through{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              npx -y @stripe/mcp
            </code>
            ; whatsapp-mcp-macos installs as a global binary called{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp-mcp
            </code>
            . Restart the host and the agent sees both tool surfaces at once.
          </p>
          <AnimatedCodeBlock
            code={mergedConfigCode}
            language="json"
            filename="~/.claude.json (excerpt)"
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            The Stripe key sits in the args array; if you prefer OAuth, swap the
            stdio entry for the remote server at mcp.stripe.com and the WhatsApp
            half is unchanged. Mixed transports in one host config is fine.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16" id="walkthrough">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            One full payment-link flow, end to end
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Here is the entire sequence the agent runs. Five steps, two MCP
            children, one host. Step 5 is the one no Stripe-MCP guide covers.
          </p>
          <StepTimeline steps={walkthroughSteps} />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What the JSON-RPC traffic looks like
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            The host serializes the agent&apos;s tool calls and routes each one
            to whichever child owns the named tool. The Stripe child handles
            create_payment_link. The WhatsApp child handles whatsapp_search,
            whatsapp_open_chat, whatsapp_send_message. The host stitches the
            replies back into the agent&apos;s context.
          </p>
          <SequenceDiagram
            title="agent loop: mint, search, open, send, verify"
            actors={["Agent", "Host", "Stripe MCP", "WhatsApp MCP"]}
            messages={[
              { from: 0, to: 1, label: "create_payment_link($49)", type: "request" },
              { from: 1, to: 2, label: "tools/call (stdio fd 0)", type: "request" },
              { from: 2, to: 1, label: "{ url: 'https://buy.stripe.com/...' }", type: "response" },
              { from: 1, to: 0, label: "URL returned to model", type: "response" },
              { from: 0, to: 1, label: "whatsapp_search('Acme Coffee')", type: "request" },
              { from: 1, to: 3, label: "tools/call (stdio fd 0)", type: "request" },
              { from: 3, to: 1, label: "[{ index:0, name:'Acme Coffee' }]", type: "response" },
              { from: 0, to: 1, label: "whatsapp_open_chat(0)", type: "request" },
              { from: 1, to: 3, label: "tools/call (stdio fd 0)", type: "request" },
              { from: 3, to: 1, label: '{ active: "Acme Coffee" }', type: "response" },
              { from: 0, to: 1, label: "whatsapp_send_message(text + URL)", type: "request" },
              { from: 1, to: 3, label: "tools/call (stdio fd 0)", type: "request" },
              { from: 3, to: 1, label: '{ verified: true, to: "Acme Coffee" }', type: "response" },
            ]}
          />
        </section>

        <GlowCard className="max-w-4xl mx-auto px-6 my-16">
          <div className="p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-3">
              anchor fact
            </p>
            <h3 className="text-2xl font-bold text-zinc-900 mb-3">
              <NumberTicker value={1} /> string prefix is the entire delivery
              receipt
            </h3>
            <p className="text-zinc-600 leading-relaxed mb-4">
              After the keypress, whatsapp-mcp sleeps 1.0 second and re-walks the
              WhatsApp accessibility tree. It collects every AXGenericElement and
              looks for one whose description begins with the literal prefix{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                Your message,{" "}
              </code>
              . That match, in <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">Sources/WhatsAppMCP/main.swift</code> at line{" "}
              <strong>930</strong>, is the proof the bubble landed in the chat.
              No webhook, no DLR, no cloud round-trip; just an AX tree re-read.
            </p>
            <p className="text-zinc-600 leading-relaxed">
              Stripe MCP&apos;s create_payment_link returns a URL but never
              observes anything beyond the API. The pairing exists because that
              one re-read is the closure of the loop the Stripe-only flow leaves
              open.
            </p>
          </div>
        </GlowCard>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            The verification code, in source
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            The implementation is a few lines. It is worth reading because most
            guides describe MCP delivery verification as a black box; here it is
            seven if-statements over the AX tree.
          </p>
          <AnimatedCodeBlock
            code={verificationCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift, line 923"
          />
          <p className="text-zinc-600 mt-6 leading-relaxed">
            If the prefix scan matches, the JSON response carries{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              verified:true
            </code>
            . If not, the response still says{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              success:true
            </code>{" "}
            (because Cmd+V plus Return was issued) but flips{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              verified
            </code>{" "}
            to false and includes the last bubble it found in a warning field.
            That gives the agent enough to retry, escalate, or surface the
            failure.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Watching the chain run, on a single host
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Both children show up in the same process tree under the host. The
            agent issues calls in order; each goes to whichever child owns the
            named tool.
          </p>
          <TerminalOutput
            title="merged Stripe + WhatsApp MCP session, top to bottom"
            lines={terminalLines}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <ComparisonTable
            heading="WhatsApp MCP vs WhatsApp Business API for agent delivery"
            intro="Same outbound channel, two very different cost and provisioning shapes."
            productName="WhatsApp MCP (macOS, AX-driven)"
            competitorName="WhatsApp Business API"
            rows={compareRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Where the pairing genuinely fits, and where it does not
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            This shape (Stripe MCP plus WhatsApp MCP, both as stdio children of
            the same host) is the right tool when the customer is already a
            WhatsApp contact, the volume is human-scale (tens to low hundreds of
            sends per day), and the operator is comfortable having the macOS
            machine awake. It is what most agents helping a small operator
            convert quotes into paid invoices will reach for.
          </p>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            It is the wrong shape for high-throughput automated billing across
            thousands of customers per day, for any flow that needs to run while
            the operator is asleep with the laptop closed, and for jurisdictions
            where business-initiated WhatsApp messages legally require pre-approved
            templates. For those, the WhatsApp Business API is the correct
            transport and the agent should call it through whichever wrapper your
            stack already has.
          </p>
          <p className="text-zinc-600 leading-relaxed">
            Most agents working with Stripe MCP fall into the first bucket. The
            pairing closes the loop the Stripe-only flow leaves open, and it does
            it for free, with verification, on the same host the agent already
            uses.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Wiring Stripe MCP into a real customer-facing flow?"
          description="30 minutes on the merged config, the verification semantics, and the cases where the Business API still wins. Bring your tools/list output."
        />

        <FaqSection items={faqItems} />

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Talk through Stripe MCP plus WhatsApp delivery on a 30-minute call"
        />
      </article>
    </>
  );
}
