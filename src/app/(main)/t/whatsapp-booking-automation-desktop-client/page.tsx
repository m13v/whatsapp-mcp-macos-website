import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@seo/components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/whatsapp-booking-automation-desktop-client";
const PUBLISHED = "2026-05-15";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "WhatsApp booking automation on the desktop client, with the chat history actually read",
  description:
    "Booking automation on WhatsApp usually means Calendly + Zapier + a Meta Business API template firing into the void. The desktop-client path is different: a local MCP server drives the WhatsApp Mac app, reads the existing booking thread, drafts a reply that references the customer's own words, and verifies delivery from the rendered chat. Walks the read/send loop line by line.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "WhatsApp booking automation through the macOS desktop client",
    description:
      "Read the booking thread, draft a confirmation that references the customer's last message, send it through the same WhatsApp app you already use. No Business API, no templates, no 24-hour window.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "WhatsApp booking automation via the desktop client (no Business API)",
    description:
      "An MCP server on macOS that reads the customer's existing booking thread before replying. Four tool calls: list unread, read context, send confirmation, verify delivery.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "WhatsApp booking automation on the desktop client" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "WhatsApp booking automation on the desktop client", url: PAGE_URL },
];

const parseMessagesCode = `// Sources/WhatsAppMCP/main.swift, lines 488 to 527 (abridged)
// Two prefix tags reconstruct the thread:
//   "message, "      = inbound (the customer wrote this)
//   "Your message, " = outbound (you wrote this)
func parseMessages(from elements: [AXElementInfo], limit: Int) -> [MessageInfo] {
    var messages: [MessageInfo] = []
    let genericElements = findElements(in: elements, role: "AXGenericElement")
    for el in genericElements {
        let desc = cleanUnicode(el.description ?? "")
        if desc.isEmpty { continue }
        if desc.hasPrefix("message, ") || desc.hasPrefix("Your message, ") {
            let isFromMe = desc.hasPrefix("Your message, ")
            let prefix = isFromMe ? "Your message, " : "message, "
            let rest = String(desc.dropFirst(prefix.count))

            // Pull "Received from <Name>" or "Sent to <Name>" off the end.
            // Then peel the time suffix ", 3:47 PM" or ", 15:47".
            // What's left is the actual message text.
            // ...
            messages.append(MessageInfo(
                sender: isFromMe ? "me" : sender,
                text: text,
                time: time,
                isFromMe: isFromMe
            ))
        }
    }
    return Array(messages.suffix(limit))
}`;

const readHandlerCode = `// Sources/WhatsAppMCP/main.swift, lines 878 to 885
func handleReadMessages(args: [String: Value]?) throws -> String {
    if let err = requireAccessibility() { return err }
    let pid = try ensureWhatsAppRunning()
    let limit = (try getOptionalInt(from: args, key: "limit")) ?? 20
    let elements = traverseAXTree(pid: pid)
    let messages = parseMessages(from: elements, limit: limit)
    return serializeToJsonString(messages) ?? "[]"
}`;

const verifyCode = `// Sources/WhatsAppMCP/main.swift, lines 923 to 957 (abridged)
// After pressReturn() the function does NOT return yet.
// It walks the AX tree a SECOND time and looks for the new bubble.
let postElements = traverseAXTree(pid: pid)
let genericElements = findElements(in: postElements, role: "AXGenericElement")

var lastSentMessage: String? = nil
for el in genericElements {
    let desc = cleanUnicode(el.description ?? "")
    if desc.hasPrefix("Your message, ") {
        let rest = String(desc.dropFirst("Your message, ".count))
        // strip ", 3:47 PM" suffix
        // ...
        lastSentMessage = text.trimmingCharacters(in: CharacterSet(charactersIn: ", "))
    }
}

// Compare against what we tried to send. Case-insensitive, prefix-tolerant
// (emoji and unicode normalization can shift the tail).
let verified: Bool = lastSentMessage?.lowercased()
    .contains(message.lowercased()) ?? false

return verified
  ? "{\\"success\\": true, \\"verified\\": true, \\"to\\": \\"\\(activeName)\\"}"
  : "{\\"success\\": true, \\"verified\\": false, \\"to\\": \\"\\(activeName)\\"}"`;

const readTerminalLines = [
  {
    type: "command" as const,
    text:
      'whatsapp_search "Priya" && whatsapp_open_chat 0 && whatsapp_read_messages 12',
  },
  {
    type: "output" as const,
    text: '[',
  },
  {
    type: "output" as const,
    text:
      '  { "sender": "Priya Shah", "text": "hi, can I move my Wednesday 3pm to Thursday same time?", "time": "11:04 AM", "isFromMe": false },',
  },
  {
    type: "output" as const,
    text:
      '  { "sender": "me", "text": "let me check the calendar, one sec", "time": "11:05 AM", "isFromMe": true },',
  },
  {
    type: "output" as const,
    text:
      '  { "sender": "Priya Shah", "text": "thanks!", "time": "11:05 AM", "isFromMe": false }',
  },
  {
    type: "output" as const,
    text: ']',
  },
  {
    type: "info" as const,
    text:
      "// The agent now has the full booking context, names, times, and the last thing the human promised.",
  },
];

const sendTerminalLines = [
  {
    type: "command" as const,
    text:
      'whatsapp_send_message "hey Priya, Thursday 3pm is free, I moved your booking. you\'ll get a Cal.com confirmation in a second."',
  },
  {
    type: "output" as const,
    text:
      '{ "success": true, "verified": true, "to": "Priya Shah", "message": "hey Priya, Thursday 3pm is free, I moved your booking..." }',
  },
  {
    type: "info" as const,
    text:
      '// verified: true means the bubble actually appeared in the rendered chat. If it had been false, the agent retries instead of pretending it sent.',
  },
];

const decisionRows = [
  {
    feature: "How customer messages get in",
    ours: "They land in your WhatsApp Desktop sidebar like any other chat",
    competitor: "Meta forwards them to a public HTTPS webhook you host",
  },
  {
    feature: "Reading the existing thread before replying",
    ours: "whatsapp_read_messages, returns the last 20 by default",
    competitor:
      "You re-fetch through the Graph API, scoped to the 24h conversation window",
  },
  {
    feature: "Sending a free-form confirmation",
    ours: "whatsapp_send_message, plain text, no template",
    competitor:
      "Pre-approved template only outside the 24h window, per-conversation fee",
  },
  {
    feature: "What you pay Meta",
    ours: "Nothing, you're a normal WhatsApp user",
    competitor:
      "Per-conversation pricing, tier varies by category and region",
  },
  {
    feature: "Where the agent runs",
    ours: "Locally on your Mac, beside the app",
    competitor: "Hosted somewhere with public ingress for the webhook",
  },
  {
    feature: "How you verify delivery",
    ours: "AX tree is re-read, 'Your message, <text>' bubble must appear",
    competitor:
      "Status webhook callbacks (sent, delivered, read), eventually consistent",
  },
];

const stepItems = [
  {
    number: 1,
    title: "List the unread bookings sitting in your sidebar",
    description:
      "whatsapp_list_chats with filter \"unread\". The sidebar's already filtered to the people who actually need a reply.",
    detail:
      "The product reads the WhatsApp Mac sidebar through accessibility, walks AXButton elements, and returns chats with unread counts. No fetch loop, no webhook subscription, no Graph API token. If it's in your sidebar, it's in the JSON the agent gets back.",
  },
  {
    number: 2,
    title: "Open one and read the full booking thread",
    description:
      "whatsapp_search → whatsapp_open_chat → whatsapp_read_messages. The agent sees what the customer actually wrote, in their words.",
    detail:
      "This is the part every Business-API booking pipeline gets wrong. Meta gives you a webhook payload with one inbound message and a conversation ID. The agent has no idea what the customer said three messages ago. The desktop-client path returns the parsed thread — sender, text, time, who-sent-which — so the agent can confirm a reschedule by referencing the original time the customer asked about.",
  },
  {
    number: 3,
    title: "Draft and send a free-form reply",
    description:
      "whatsapp_send_message with plain text. No template, no category, no approval queue.",
    detail:
      "Because the agent is sending through the desktop client as you, the message can quote the customer's words back to them, reference internal calendar slots, include emoji, links, anything you would type by hand. The flow is paste-into-compose-then-Return, not a POST to graph.facebook.com.",
  },
  {
    number: 4,
    title: "Verify the bubble actually appeared",
    description:
      "Same call. The handler walks the AX tree a second time and looks for a 'Your message, <text>' bubble before returning verified: true.",
    detail:
      "If WhatsApp silently rejected the input (focus stolen by an autocorrect modal, the chat header changed, accessibility went stale), verified comes back false and the agent knows to retry instead of marking the booking confirmed. It's the equivalent of Meta's delivered status callback, except synchronous and inside the same tool call.",
  },
];

const faqItems = [
  {
    q: "What does 'desktop client' buy me that the WhatsApp Business Cloud API doesn't?",
    a: "Chat context and freeform replies. The Business Cloud API is designed for outbound template blasts to opted-in lists, with a 24-hour reply window after each inbound message. Once that window closes, you can only send pre-approved templates. For booking automation that's the wrong shape, because most booking exchanges (reschedules, location confirmations, no-show follow-ups) are conversational and unpredictable. The desktop-client path treats your Mac's WhatsApp the same as any other chat: the agent reads the thread, drafts a free-form reply, sends it. No template, no window, no per-conversation fee.",
  },
  {
    q: "Is this just clicking buttons in the WhatsApp Web window?",
    a: "No, it's the native WhatsApp Catalyst app for macOS, and the agent talks to it through the macOS accessibility tree, not through a browser. Bundle id net.whatsapp.WhatsApp, AXUIElement traversal, AXMessagingTimeout 5.0s. Web automation is brittle here because WhatsApp Web's DOM uses contenteditable fields and React-controlled focus that breaks under Playwright. The accessibility-API path is the same API VoiceOver uses, so it's stable across WhatsApp releases.",
  },
  {
    q: "What does the agent actually see when it 'reads the thread'?",
    a: "It sees parsed messages. handleReadMessages walks the AX tree, finds AXGenericElement nodes whose description starts with 'message, ' (inbound) or 'Your message, ' (outbound), and returns a JSON array of { sender, text, time, isFromMe }. Default limit is 20 messages. That's enough for a booking agent to see who asked for what time, what was offered, and whether anyone confirmed. Source: main.swift parseMessages at line 488 to 527.",
  },
  {
    q: "How does it verify a booking confirmation actually sent?",
    a: "After pressing Return, the send handler does NOT just return success. It walks the AX tree a second time, finds the newest AXGenericElement whose description starts with 'Your message, ', strips the time suffix, and checks that the bubble's text contains what was sent. Only then does it return verified: true. If WhatsApp swallowed the input (focus stolen, chat header changed under us, paste failed silently), verified comes back false and the agent knows to retry. This is line 923 to 957 of main.swift.",
  },
  {
    q: "Where does the actual booking calendar fit?",
    a: "Outside this layer. The MCP server is the chat surface only. A real booking agent wires this together with a calendar tool (Cal.com, Google Calendar, an internal API) and uses the chat surface for read context and reply. The pattern is: whatsapp_read_messages to see what the customer asked → query the calendar tool → whatsapp_send_message with the answer → whatsapp_get_active_chat after a few minutes to see if they replied. The chat surface stays dumb; the agent owns the booking logic.",
  },
  {
    q: "What happens if WhatsApp Desktop isn't running?",
    a: "ensureWhatsAppRunning at line 79 of main.swift launches it, waits up to 2 seconds for the pid to appear, and returns the pid to the handler. So a cron job can kick off a 'send tomorrow's reminders' pass without you having WhatsApp open. The handler tools also activate the app before touching it (activateWhatsApp at line 89, pulls focus). If accessibility was never granted to the host process, requireAccessibility short-circuits and returns a JSON error explaining exactly which System Settings pane to open.",
  },
  {
    q: "Does it work for groups, or just 1-to-1 bookings?",
    a: "Both, with caveats. whatsapp_open_chat works on a group entry the same way it works on a contact, and read/send tools operate on whatever chat is currently focused. Useful for things like 'team daily standup' or 'family reminder' flows where the booking lives in a group thread. Caveat: in a noisy group the limit=20 default on read_messages can miss context, bump it to 50 or 100 if you need the agent to scroll further back.",
  },
  {
    q: "Honest limitations?",
    a: "macOS only, requires WhatsApp Desktop installed and accessibility granted. Not a hosted service. Not multi-tenant — one Mac, one WhatsApp account, one agent runtime. If you need a fleet sending opted-in template blasts to 50,000 strangers, this is the wrong tool and the Business Cloud API is the right one. For one solo founder or small team handling a few hundred booking-related exchanges per day, it's the simpler path.",
  },
];

const ldJsonArticle = JSON.stringify(
  articleSchema({
    url: PAGE_URL,
    headline:
      "WhatsApp booking automation on the desktop client, with the chat history actually read",
    description:
      "A four-step booking-automation flow on the WhatsApp Mac desktop app: read the thread, draft a free-form reply that references the customer's own words, send through the desktop client, verify the bubble appeared. No Meta Business API.",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: "Matthew Diakonov",
    authorUrl: "https://m13v.com",
    publisherName: "WhatsApp MCP",
    publisherUrl: "https://whatsapp-mcp-macos.com",
  }),
);

const ldJsonBreadcrumb = JSON.stringify(
  breadcrumbListSchema(breadcrumbSchemaItems),
);

const ldJsonFaq = JSON.stringify(faqPageSchema(faqItems));

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJsonArticle }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJsonBreadcrumb }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJsonFaq }}
      />

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="mx-auto max-w-3xl px-4 pb-6">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
          WhatsApp booking automation, through the desktop client your customers already message
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-zinc-600">
          Every tutorial on automating WhatsApp bookings walks you through the
          same five boxes: Calendly, Zapier or Make, Meta Business Cloud API,
          a pre-approved template, a public webhook. That stack is good at one
          thing: blasting opted-in reminders to a list. It is terrible at the
          actual booking conversation, the part where someone asks &quot;can I
          move Wednesday 3pm to Thursday?&quot; and your reply needs to
          reference what they said three messages ago. Below is the
          desktop-client path: a local{" "}
          <a
            className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
            href="https://github.com/m13v/whatsapp-mcp-macos"
          >
            MCP server
          </a>{" "}
          that drives the native WhatsApp Mac app through accessibility APIs,
          reads the thread, drafts a free-form reply, and verifies the bubble
          actually appeared before reporting success.
        </p>
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="7 min read"
        />
      </header>

      <section className="mx-auto max-w-3xl px-4 py-4">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-teal-700">
            Direct answer
          </p>
          <p className="mt-2 text-base leading-relaxed text-zinc-800">
            To automate WhatsApp bookings via the desktop client, run a local
            MCP server that talks to the native WhatsApp Mac app through
            macOS accessibility APIs. Your AI agent makes four tool calls per
            booking exchange: list unread chats, read the full thread,
            send a free-form reply, verify delivery. No Meta Business API key,
            no template approval, no 24-hour reply window, no per-conversation
            fee. The trade-off is honest: it&apos;s macOS only, single-account,
            and the WhatsApp app must be running.
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Verified against{" "}
            <code className="text-xs">Sources/WhatsAppMCP/main.swift</code> on{" "}
            2026-05-15. Source on GitHub:{" "}
            <a
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
              href="https://github.com/m13v/whatsapp-mcp-macos"
            >
              m13v/whatsapp-mcp-macos
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Pick the right path first
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The desktop-client path is not always the right answer. If you are a
          large business sending 10,000 appointment reminders a day to an
          opted-in list, the Business Cloud API exists for a reason: it scales
          horizontally, ships from Meta&apos;s infra, and the per-conversation
          fee is cheap compared to the alternative. The desktop-client path
          wins in the messy middle: a few hundred booking exchanges a day from
          a single Mac, where each reply needs context.
        </p>
        <div className="mt-6">
          <ComparisonTable
            productName="Desktop client (this product)"
            competitorName="Business Cloud API (Calendly + Zapier + Meta)"
            rows={decisionRows}
          />
        </div>
        <p className="mt-5 text-zinc-700 leading-relaxed">
          The line is pretty clean. If your booking flow needs the agent to
          read the chat, you want the left column. If your booking flow is a
          one-way reminder blast, you want the right column.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          The four-call booking loop
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Once the MCP server is wired up, every booking exchange is the same
          four-step pattern. Each step is a single tool call, and each call
          returns structured JSON the agent can act on. The shape stays the
          same whether the customer wants to confirm, reschedule, cancel, or
          ask if you also do Saturdays.
        </p>
        <div className="mt-6">
          <StepTimeline steps={stepItems} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          What reading the thread actually returns
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The interesting part is in the parser. The WhatsApp Mac app exposes
          each message bubble as an AXGenericElement with a single description
          string. Inbound bubbles start with{" "}
          <code className="text-sm">&quot;message, &quot;</code>. Outbound
          bubbles start with{" "}
          <code className="text-sm">&quot;Your message, &quot;</code>. That is
          the entire trick. The parser walks every AXGenericElement,
          discriminates by prefix, peels off the time suffix and the sender
          tag, and hands back a clean array.
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={parseMessagesCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The tool handler that wraps it is six lines, including the
          accessibility guard:
        </p>

        <div className="mt-5">
          <AnimatedCodeBlock
            code={readHandlerCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          In a real booking session it looks like this. The agent searches for
          a name, opens the top result, and pulls the last twelve messages:
        </p>

        <div className="mt-5">
          <TerminalOutput
            lines={readTerminalLines}
            title="agent session"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The agent now knows the customer is Priya, that she asked to move
          her Wednesday 3pm, that I promised to check the calendar, and that
          she said thanks. Compared to a Business API webhook payload (one
          message, a phone number, a conversation id, no past context), this
          is night and day for replying like a human.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Sending the confirmation, and verifying it landed
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The send tool is two halves. First half: click the compose textarea,
          paste the message into{" "}
          <code className="text-sm">NSPasteboard.general</code> and post
          Cmd+V, then post a Return key. Standard accessibility-driven typing.
          The second half is what makes it useful for booking automation: it
          re-reads the chat and confirms the bubble appeared before returning.
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={verifyCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The honest part: when verification fails (focus stolen,
          paste swallowed, autocorrect modal stole Return), the handler
          returns{" "}
          <code className="text-sm">verified: false</code> rather than a hard
          error. The agent can retry once and check again. Booking flows that
          double-send are worse than ones that occasionally pause for a
          retry.
        </p>

        <div className="mt-5">
          <TerminalOutput
            lines={sendTerminalLines}
            title="agent session, continued"
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          What lives outside this layer
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The MCP server is intentionally only the chat surface. It does not
          know what a booking is, what a calendar is, or what your business
          hours are. That is on purpose: every booking system is different,
          and embedding one would be the wrong abstraction.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <GlowCard>
            <div className="p-5">
              <p className="text-sm font-medium uppercase tracking-wider text-teal-700">
                What this product does
              </p>
              <ul className="mt-3 space-y-2 text-zinc-700 leading-relaxed">
                <li>Reads chats from the WhatsApp Mac sidebar</li>
                <li>Parses the message history per chat</li>
                <li>Sends free-form replies</li>
                <li>Verifies each send by re-reading the bubble</li>
                <li>Exposes all of it as MCP tools to your agent</li>
              </ul>
            </div>
          </GlowCard>
          <GlowCard>
            <div className="p-5">
              <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
                What your agent owns
              </p>
              <ul className="mt-3 space-y-2 text-zinc-700 leading-relaxed">
                <li>Calendar (Cal.com, Google Calendar, Notion, your DB)</li>
                <li>Booking state machine (held, confirmed, no-show)</li>
                <li>Business hours and slot availability</li>
                <li>Payment links if you take deposits</li>
                <li>The actual reply text and tone</li>
              </ul>
            </div>
          </GlowCard>
        </div>
        <p className="mt-6 text-zinc-700 leading-relaxed">
          A typical wiring pattern: a Claude or Cursor session has both this
          MCP server and a calendar MCP loaded. Every few minutes a cron-like
          loop calls{" "}
          <code className="text-sm">whatsapp_list_chats</code> with{" "}
          <code className="text-sm">filter: &quot;unread&quot;</code>, walks
          the unread chats, calls{" "}
          <code className="text-sm">whatsapp_read_messages</code> on each,
          asks the model what to do, and either replies or escalates to a
          human. Booking confirmations go out as free-form text that
          references whatever the customer actually wrote.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <FaqSection items={faqItems} heading="FAQ" />
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Wiring this into your booking flow?"
          description="20 minutes, share your stack, I'll tell you whether the desktop-client path fits, where the Business API path would still beat it, and what the wiring looks like end to end."
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination={CAL_LINK}
        site="WhatsApp MCP"
        description="Book a 20 min call about WhatsApp booking automation"
      />
    </article>
  );
}
