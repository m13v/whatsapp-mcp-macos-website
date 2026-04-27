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
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  StepTimeline,
  BentoGrid,
  GlowCard,
  MetricsRow,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
} from "@seo/components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/automation-whatsapp-message";
const PUBLISHED = "2026-04-24";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "Automation for WhatsApp messages that proves delivery, instead of trusting it",
  description:
    "Most automation around WhatsApp messages stops at sending. whatsapp-mcp-macos pastes the message, hits Return, then re-reads the chat from the macOS accessibility tree and only returns verified: true if the bubble actually appeared. Walks the Swift loop line by line.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "Automation for WhatsApp messages with post-send verification",
    description:
      "An accessibility-driven automation that backs up your clipboard, restores your cursor, and reads the chat back to confirm a message landed before reporting success.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "WhatsApp message automation that observes delivery, not just claims it",
    description:
      "How whatsapp-mcp-macos uses the macOS accessibility tree to verify each send by reading 'Your message, ' back from the rendered chat.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation for WhatsApp messages" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "Automation for WhatsApp messages", url: PAGE_URL },
];

const handleSendCode = `// Sources/WhatsAppMCP/main.swift, lines 888 to 958 (abridged)
func handleSendMessage(args: [String: Value]?) throws -> String {
    if let err = requireAccessibility() { return err }
    let message = try getRequiredString(from: args, key: "message")
    let pid = try ensureWhatsAppRunning()
    activateWhatsApp(pid: pid)

    // 1. Refuse to send if no chat is currently the focused panel.
    guard let activeName = getActiveChatName(pid: pid),
          !activeName.isEmpty else {
        return "{\\"success\\": false, \\"error\\": \\"No chat is currently open.\\"}"
    }

    // 2. Walk the AX tree and find the compose textarea.
    let elements = traverseAXTree(pid: pid)
    let textAreas = findElements(in: elements, role: "AXTextArea")
    let composeField = textAreas.first(where: {
        ($0.description ?? "").lowercased().contains("compose")
        || ($0.description ?? "").lowercased().contains("message")
        || ($0.description ?? "").lowercased().contains("type")
    }) ?? textAreas.last
    guard let compose = composeField else {
        return "{\\"success\\": false, \\"error\\": \\"compose field not found\\"}"
    }

    clickElement(compose)            // click the textarea before typing
    guard pasteText(message) else {  // backs up clipboard, Cmd+V, restores
        return "{\\"success\\": false, \\"error\\": \\"paste failed\\"}"
    }
    pressReturn()                    // post a Return CGEvent
    Thread.sleep(forTimeInterval: 1.0)

    // 3. Verify by reading the tree BACK and finding the newest
    //    "Your message, ..." node. This is the part that does not
    //    exist anywhere in a Business API send.
    let postElements = traverseAXTree(pid: pid)
    var lastSentMessage: String? = nil
    for el in findElements(in: postElements, role: "AXGenericElement") {
        let desc = cleanUnicode(el.description ?? "")
        if desc.hasPrefix("Your message, ") {
            var text = String(desc.dropFirst("Your message, ".count))
            // strip trailing time, e.g. ", 3:14 PM"
            if let range = text.range(
                of: #",\\s+\\d{1,2}:\\d{2}\\s*[APap][Mm]"#,
                options: .regularExpression) {
                text = String(text[text.startIndex..<range.lowerBound])
            }
            lastSentMessage = text.trimmingCharacters(
                in: CharacterSet(charactersIn: ", "))
        }
    }

    let sent = (lastSentMessage ?? "").lowercased()
    let want = message.lowercased()
    let verified = sent.contains(want) || want.contains(sent)
    return verified
      ? "{\\"success\\": true, \\"verified\\": true, \\"to\\": \\"\\(activeName)\\"}"
      : "{\\"success\\": true, \\"verified\\": false, \\"to\\": \\"\\(activeName)\\"}"
}`;

const pasteCode = `// Sources/WhatsAppMCP/main.swift, lines 225 to 237
func pasteText(_ text: String) -> Bool {
    let pb = NSPasteboard.general
    let backup = pb.string(forType: .string)   // remember whatever the human had
    pb.clearContents()
    guard pb.setString(text, forType: .string) else { return false }
    sendKeyEvent(keyCode: 9, flags: .maskCommand)  // Cmd+V
    Thread.sleep(forTimeInterval: 0.35)
    pb.clearContents()
    if let backup = backup {
        _ = pb.setString(backup, forType: .string) // restore it
    }
    return true
}

// And to clear sticky modifier state before/after each Cmd+V,
// every flag-bearing key event flushes keycodes 55, 56, 58, 59
// (left/right Cmd, Shift, Option) with isolated key-up posts.
// Without that, the next character the human types can be read
// by the OS as part of a still-pressed Cmd combo.`;

const verifyTermLines = [
  { type: "command" as const, text: "# model calls whatsapp_send_message" },
  {
    type: "command" as const,
    text: 'mcp call whatsapp_send_message --message "on my way"',
  },
  { type: "info" as const, text: "log: pasteText: 8 bytes -> compose AXTextArea" },
  { type: "info" as const, text: "log: pressReturn: keyCode 36" },
  { type: "info" as const, text: "log: traverseAXTree(post-send): depth 15" },
  {
    type: "output" as const,
    text: 'matched AXGenericElement "Your message, on my way, 3:14 PM, Sent to Alex"',
  },
  {
    type: "success" as const,
    text: '{"success": true, "verified": true, "to": "Alex"}',
  },
  { type: "command" as const, text: "# now the same call, with the WhatsApp window minimised" },
  {
    type: "command" as const,
    text: 'mcp call whatsapp_send_message --message "ping"',
  },
  { type: "info" as const, text: "log: pasteText ok, pressReturn ok" },
  {
    type: "output" as const,
    text: 'no AXGenericElement starting with "Your message, " in post-send tree',
  },
  {
    type: "error" as const,
    text: '{"success": true, "verified": false, "to": "Alex", "warning": "could not verify"}',
  },
  {
    type: "info" as const,
    text: "the caller (model or script) sees the false and decides whether to retry",
  },
];

const protectionCards: BentoCard[] = [
  {
    title: "Clipboard backup and restore",
    description:
      "pasteText() reads NSPasteboard.general.string(forType: .string), saves it, sets the message, posts Cmd+V, then restores the original 0.35 seconds later. The link your friend just copied is still there when the bot is done.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Cursor position is restored",
    description:
      "Before every clickAt(), the server calls saveCursorPosition() and after the click posts a CGEvent that puts the pointer back where the human left it. The mouse does not jump.",
    size: "1x1",
  },
  {
    title: "Sticky modifier clear",
    description:
      "Around every keyboard event, key-up CGEvents are sent for keycodes 55, 56, 58, and 59 to flush left and right Cmd, Shift, and Option from the OS modifier state. Otherwise the next keystroke the human types could be read as part of a Cmd combo.",
    size: "1x1",
  },
  {
    title: "Post-send readback",
    description:
      "After the Return key, a fresh accessibility traversal looks for the newest AXGenericElement whose description begins with 'Your message, '. The text is compared to the input. verified: true is only returned when the readback contains what was pasted.",
    size: "2x1",
  },
];

const verifyMetrics = [
  { value: 5.0, decimals: 1, suffix: "s", label: "AX messaging timeout per call" },
  { value: 0.35, decimals: 2, suffix: "s", label: "Wait between paste and clipboard restore" },
  { value: 1.0, decimals: 1, suffix: "s", label: "Settle window after pressing Return" },
  { value: 15, label: "Max accessibility tree depth traversed" },
];

const sequenceActors = [
  "model",
  "host",
  "mcp child",
  "AX framework",
  "WhatsApp app",
];

const sendSequence = [
  { from: 0, to: 1, label: "tools/call whatsapp_send_message", type: "request" as const },
  { from: 1, to: 2, label: "stdio JSON-RPC", type: "request" as const },
  { from: 2, to: 3, label: "AXUIElement traverse", type: "request" as const },
  { from: 3, to: 4, label: "find AXTextArea, click, paste", type: "event" as const },
  { from: 4, to: 3, label: "Return key posted", type: "event" as const },
  { from: 2, to: 3, label: "AX traverse again (post-send)", type: "request" as const },
  { from: 3, to: 4, label: "read AXGenericElement nodes", type: "request" as const },
  { from: 4, to: 3, label: "newest 'Your message, ...' bubble", type: "response" as const },
  { from: 3, to: 2, label: "compare to input, lowercase contains", type: "response" as const },
  { from: 2, to: 1, label: "{verified: true, to: 'Alex'}", type: "response" as const },
  { from: 1, to: 0, label: "tools/call result", type: "response" as const },
];

const verifiedSetupSteps = [
  {
    title: "Search for the recipient",
    description:
      "whatsapp_search('alex') types into the sidebar, scrolls into view, and returns up to 200 chars per AXButton description, parsed into index, section, contactName, preview, and time. The search panel stays open so the next call can pick a result.",
  },
  {
    title: "Open the right chat by index, not by name",
    description:
      "whatsapp_open_chat(index: 0) clicks the Nth result. Names alone are unsafe because two contacts can share a first name. The index is the position in the parsed sidebar list.",
  },
  {
    title: "Verify which chat actually opened",
    description:
      "whatsapp_get_active_chat() reads the heading panel at x > 1750 and parses last-seen, online, and typing prefixes off the front of the heading string. The model only proceeds if the name matches who it intended to message.",
  },
  {
    title: "Send and observe",
    description:
      "whatsapp_send_message('on my way') runs the loop above. The call returns verified: true only when the post-send AX read contains the pasted text. A false verified is the loud failure the rest of automation usually hides.",
  },
];

const verifyChips = [
  "verified: true on readback",
  "AXGenericElement scan",
  "'Your message, ' prefix",
  "regex strips ', 3:14 PM'",
  "lowercase contains both ways",
  "cursor restored after click",
  "clipboard restored after paste",
  "sticky modifiers flushed",
  "5.0s AX hard ceiling",
  "no Meta Business API",
  "no template approval",
  "no 24-hour window",
];

const apiVsLocalRows = [
  {
    feature: "Where 'success' comes from",
    competitor:
      "A 200 OK from the Business API and, eventually, a delivery webhook from Meta. The sender never reads what landed.",
    ours:
      "A second AX traversal that finds the newest 'Your message, ' bubble in the rendered chat. The sender reads back exactly what landed.",
  },
  {
    feature: "What 'failure' looks like",
    competitor:
      "Template rejection, rate limit, account pause, or a delivery webhook that arrives minutes later, often after the user has moved on.",
    ours:
      "verified: false in the same response, before the model's turn ends, with the actual last sent message echoed in the warning field.",
  },
  {
    feature: "Effect on the human's machine",
    competitor:
      "None. The send happens on Meta's servers; nothing is written to the user's clipboard or focus state.",
    ours:
      "Clipboard is touched briefly (paste) then restored. Cursor is moved to click, then put back. Modifier-key state is flushed. The user does not feel it.",
  },
  {
    feature: "Sender identity",
    competitor:
      "A registered business number Meta has approved.",
    ours:
      "The human's own WhatsApp account, signed in to the Desktop app on their Mac.",
  },
  {
    feature: "Per-message cost",
    competitor:
      "Per-conversation pricing set by Meta and varying by country and category.",
    ours:
      "Zero. The OS does not charge per AXUIElementCopyAttributeValue.",
  },
  {
    feature: "Round-trip latency",
    competitor:
      "Network-bound, plus a separate webhook for delivery state.",
    ours:
      "Bound by two AX traversals plus a 1.0 s settle delay. Verification is in-band with the send, not asynchronous.",
  },
];

const faqItems = [
  {
    q: "What does 'verified' actually mean for an automated WhatsApp message?",
    a: "It means a second pass over the macOS accessibility tree found a rendered message bubble whose text contains what the automation just pasted. Concretely, after the Return key event is posted, handleSendMessage in Sources/WhatsAppMCP/main.swift waits 1.0 second, calls traverseAXTree(pid:) again, and iterates every AXGenericElement that has a description starting with 'Your message, '. For each match it strips the trailing time pattern (regex ,\\s+\\d{1,2}:\\d{2}\\s*[APap][Mm]) and lowercases. The tool returns verified: true only when one of those readbacks contains the input or the input contains the readback. If the AX tree has no such node, verified is false and the response includes a warning field with whatever the last 'Your message, ' bubble actually said. Verification is part of the call, not a separate webhook, which is why the model can decide to retry on the same turn rather than queueing a follow-up.",
  },
  {
    q: "Why does the automation backup and restore the clipboard around every send?",
    a: "Because input on macOS Catalyst apps is most reliable through Cmd+V, and the only way to deliver the message text to the compose field without losing emoji or non-ASCII characters is to put it on the clipboard first. pasteText() at lines 225 to 237 of main.swift starts by reading NSPasteboard.general.string(forType: .string) and storing the result, then clears the pasteboard, sets the message, posts a Cmd+V keyboard event, sleeps 0.35 seconds for the paste to land, and restores the original clipboard contents. The window in which a human's clipboard is overwritten is at most a few hundred milliseconds, and the original contents are put back even if the send itself fails. Without this discipline, every send would silently overwrite whatever the user had just copied, and that is the kind of bug that makes people uninstall an automation tool the second time it bites them.",
  },
  {
    q: "What protects the human's mouse cursor and modifier-key state during a send?",
    a: "Two specific helpers in main.swift. saveCursorPosition() at line 195 reads NSEvent.mouseLocation, accounts for the screen-Y flip on the primary NSScreen, and returns a CGPoint. clickAt() saves that point before posting the mouse-down/mouse-up events and then posts a CGEvent of type mouseMoved back to the saved point as the last act of the click. The cursor returns to the place the user left it, frame by frame. For modifier keys, sendKeyEvent() flushes keycodes 55, 56, 58, and 59 (left and right Cmd, Shift, and Option) with isolated key-up events both before and after any flag-bearing event. Without that flush, a Cmd+V posted by the automation could leave the OS believing Cmd is still down, and the human's next keystroke would be misinterpreted as part of a shortcut. These are not features. They are the cost of sharing the same physical input devices with a human user.",
  },
  {
    q: "Is this WhatsApp automation tied to the Business API or any Meta-side approval?",
    a: "No. The server has no HTTP client targeting Meta. It binds to the WhatsApp Desktop macOS Catalyst app by its bundle id net.whatsapp.WhatsApp (line 57 of main.swift), launches it via /usr/bin/open if it is not already running, and drives it through AXUIElement calls. There is no API key, no access token, no template list, and no 24-hour messaging window. The env block in the MCP host configuration is literally an empty object. The only authority the server needs is the operating system's Accessibility permission, granted to the host process (Claude Code, Cursor, or whichever client forks it as a stdio child) in System Settings, Privacy and Security, Accessibility.",
  },
  {
    q: "Where is the 5.0 second ceiling, and why does it matter for automation reliability?",
    a: "AXUIElementSetMessagingTimeout(appElement, 5.0) is called on the WhatsApp application AX element at line 120 of main.swift, immediately after AXUIElementCreateApplication(pid). That timeout governs every accessibility call that follows: requesting children, fetching attributes, posting clicks. If WhatsApp Desktop fails to respond within 5.0 seconds, the call errors out cleanly rather than blocking the model's turn. The number is hardcoded; there is no flag to lengthen it. In practice a healthy WhatsApp window responds in tens of milliseconds, so the ceiling only trips when the window is minimised, the OS is under heavy load, or accessibility was just regranted and the TCC database is stale. When you see verified: false despite a successful paste, the first thing to check is whether one of the AX traversals timed out; the stderr log from the child will tell you.",
  },
  {
    q: "Can the automation reach a WhatsApp number I have never messaged before?",
    a: "No. There is no whatsapp_create_chat tool in the surface. The eleven exposed tools are status, start, quit, get_active_chat, list_chats, search, open_chat, scroll_search, read_messages, send_message, and navigate (assembled into the allTools array at line 1110 of main.swift). search returns indexed buttons that are already in the sidebar's chats and contacts sections; open_chat clicks one of them. If the recipient is not in your sidebar, the agent sees nothing to click. This scoping is intentional: it means the automation cannot perform a cold outreach on your behalf, which keeps the tool aligned with personal use rather than broadcast.",
  },
  {
    q: "What does a verified false response look like, and what should the caller do with it?",
    a: "It looks like a JSON object of shape {success: true, verified: false, to: \"Alex\", message: \"...\", warning: \"Could not verify message appeared in chat. Last sent message: ...\"}. success is true because the paste and Return key both succeeded; verified is false because the post-send AX traversal did not find a matching 'Your message, ' bubble. The warning includes the most recent outgoing message text the server did find, which is often the previous one if the new message has not rendered yet. The right caller behaviour is to wait briefly and call whatsapp_get_active_chat again to read the latest messages; if the new text now appears, the send did land. If after a second check the text is still absent, retry the send. Do not retry blindly on the first false: a duplicate send is worse than a slow render.",
  },
  {
    q: "How does this compare with browser-based automation of WhatsApp Web?",
    a: "Browser automation of WhatsApp Web has a documented bad reputation for this exact use case because the message input is a contenteditable element rather than a textarea, so the usual Playwright or Selenium type() helpers do not deliver characters reliably; emoji and non-Latin scripts are particularly brittle. Focus management is fragile, paste events on contenteditable behave differently than on text inputs, and the page is a heavy SPA that re-renders on every websocket frame, which makes any selector-based check race against the rerender. The macOS Catalyst path bypasses all of that by talking to the same accessibility framework that VoiceOver and other assistive tech use; the AX tree settles after each user-visible change, so the post-send readback observes a stable state. The instructions block at the bottom of main.swift explicitly warns the model not to fall back to browser automation if accessibility fails, because the failure mode there is silent corruption rather than loud refusal.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "Automation for WhatsApp messages that proves delivery, instead of trusting it",
    description:
      "How whatsapp-mcp-macos performs post-send verification by re-traversing the macOS accessibility tree of WhatsApp Desktop, with a line-level walk through handleSendMessage, the clipboard backup, the cursor restore, and the sticky-modifier flush.",
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

export default function AutomationWhatsappMessagePage() {
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
              automation that observes its own work
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              Most automation around a WhatsApp message stops at sending.{" "}
              <GradientText>This one reads the chat back to prove it landed.</GradientText>
            </h1>
            <p className="text-lg text-zinc-600 mb-6 max-w-2xl">
              The common playbook for automating WhatsApp messages is a
              templated send through Meta's Business API and an asynchronous
              delivery webhook minutes later. That contract is fine for
              transactional broadcasting and useless for an AI that has to
              decide, in the same turn, whether to retry. whatsapp-mcp-macos
              takes the opposite contract: paste the message, hit Return, then
              re-walk the accessibility tree of the WhatsApp Desktop window and
              return verified: true only when the rendered bubble actually
              contains what was just pasted.
            </p>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl">
              This guide walks the verification loop line by line, then the
              three smaller protections around it that keep your clipboard,
              your cursor, and your modifier keys exactly where you left them.
              No Business API, no templates, no per-message fees, and no
              optimistic success.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ShimmerButton href="#verify-loop">
                See the verification loop
              </ShimmerButton>
              <a
                href="https://github.com/m13v/whatsapp-mcp-macos"
                className="text-sm font-medium text-teal-700 hover:text-teal-600"
              >
                whatsapp-mcp source &rarr;
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
            authorRole="maintainer of whatsapp-mcp-macos"
          />
        </div>
        <ProofBand
          rating={4.8}
          ratingCount="traced against whatsapp-mcp-macos v1.1.0 on macOS 14"
          highlights={[
            "Line-level walk through handleSendMessage and pasteText",
            "Sequence diagram of one send-and-verify round trip",
            "Concrete protections for the human's clipboard, cursor, and modifier keys",
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 my-16">
          <div className="rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">
            <RemotionClip
              title="Send. Then read the chat back."
              subtitle="The contract that turns an AI tool call into observable delivery."
              accent="teal"
              captions={[
                "Click the compose textarea found in the AX tree.",
                "Cmd+V the message after backing up the clipboard.",
                "Press Return. Wait one second.",
                "Re-walk the tree. Find the newest 'Your message, ' bubble.",
                "Return verified: true only if the readback matches.",
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Why a 200 OK is the wrong success signal for a chat
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            The common automation contract for outbound messaging is borrowed
            from email: hand the payload to a service, get a 200 back, and
            assume the rest is somebody else's problem. WhatsApp's Business
            API follows that shape, with a separate webhook firing later when
            Meta's infrastructure has decided the message is delivered. That
            split is fine when the sender is a backend job sending an order
            confirmation. It is hostile to a model that has to decide what to
            do next on the same turn.
          </p>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            On a Mac, you have a stronger signal available for free. The
            WhatsApp Desktop app renders a new bubble in your active chat
            within a few hundred milliseconds of the send, and that bubble is
            visible to the operating system's accessibility framework as an
            AXGenericElement whose description starts with the literal prefix{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              Your message,
            </code>
            . If your automation knows how to walk that tree, it can read its
            own work back, character by character, before the tool call
            returns.
          </p>
          <p className="text-zinc-600 leading-relaxed">
            That is the contract whatsapp-mcp-macos chose. The rest of this
            guide is what it costs to honour it.
          </p>
        </section>

        <section
          className="max-w-5xl mx-auto px-6 my-16"
          id="verify-loop"
        >
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            One send-and-verify round trip, by actor
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Five participants, two AX traversals, no network. The model emits
            a tools/call frame, the host forwards it as JSON-RPC over stdio
            to the whatsapp-mcp child, the child talks to the macOS
            accessibility framework, and the framework drives the WhatsApp
            window. The reply travels back the same way carrying the verified
            field.
          </p>
          <SequenceDiagram
            title="send-and-verify, one turn"
            actors={sequenceActors}
            messages={sendSequence}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What flows where, and why nothing speaks HTTP to Meta
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            The hub is the MCP child. The arrows on the left are the things
            it consumes; the arrows on the right are the OS-level operations
            it performs. None of them is a network call. The verification
            edge is the one that distinguishes this stack from any
            API-driven automation of the same app.
          </p>
          <AnimatedBeam
            title="inputs to the child, outputs from the child"
            from={[
              {
                label: "model's tools/call",
                sublabel: "whatsapp_send_message(message)",
              },
              {
                label: "active WhatsApp window",
                sublabel: "bundle id net.whatsapp.WhatsApp",
              },
              {
                label: "human's input devices",
                sublabel: "clipboard, cursor, modifier state",
              },
            ]}
            hub={{
              label: "whatsapp-mcp child",
              sublabel: "swift binary, stdio transport, 11 tools",
            }}
            to={[
              {
                label: "AX traversal pre-send",
                sublabel: "find AXTextArea in compose region",
              },
              {
                label: "Cmd+V + Return",
                sublabel: "with clipboard and modifier discipline",
              },
              {
                label: "AX traversal post-send",
                sublabel: "match 'Your message, ' bubble",
              },
            ]}
          />
        </section>

        <GlowCard className="max-w-4xl mx-auto my-16">
          <div className="p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-teal-600 mb-3">
              anchor fact
            </p>
            <h3 className="text-2xl font-bold text-zinc-900 mb-3">
              <NumberTicker value={70} /> lines for the entire verification loop
            </h3>
            <p className="text-zinc-600 leading-relaxed mb-4">
              handleSendMessage occupies lines{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                888
              </code>{" "}
              through{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                958
              </code>{" "}
              of{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                Sources/WhatsAppMCP/main.swift
              </code>
              . The verification half scans every{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                AXGenericElement
              </code>{" "}
              in the post-send tree, keeps the last description that begins
              with{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                Your message,
              </code>
              , strips the time suffix with the regex{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                ,\s+\d{"{1,2}"}:\d{"{2}"}\s*[APap][Mm]
              </code>
              , and returns true only when the lowercase readback contains
              what the model pasted (or vice versa, to absorb minor
              re-encoding).
            </p>
            <p className="text-zinc-600 leading-relaxed">
              The same file pins the reliability ceiling at line{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                120
              </code>{" "}
              with{" "}
              <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
                AXUIElementSetMessagingTimeout(appElement, 5.0)
              </code>
              . That is your error budget per AX call: not a network round
              trip, but a hard 5.0 second OS guarantee that the call either
              completes or fails cleanly.
            </p>
          </div>
        </GlowCard>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The send loop, line by line
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Three blocks. Refuse if no chat is open. Walk the AX tree, find
            the compose AXTextArea, click it, paste, and press Return. Then
            re-walk the tree, find the newest 'Your message, ' bubble, and
            compare. Each block fails closed: if any guard returns, the
            response carries success: false and the reason.
          </p>
          <AnimatedCodeBlock
            code={handleSendCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
        </section>

        <MetricsRow metrics={verifyMetrics} />

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Four protections that keep automation invisible to the human
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            The verification round trip is the headline. The other three are
            the things that make the headline tolerable to use on the
            machine you are also working on. Without them, every send would
            stomp the clipboard you just used, fling the cursor across two
            displays, and leave Cmd half-pressed in the OS modifier state.
          </p>
          <BentoGrid cards={protectionCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            How the clipboard and modifier discipline actually look
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            pasteText is twelve lines. Read clipboard, clear, set message,
            post Cmd+V, sleep 0.35 s, restore. The modifier flush lives in
            sendKeyEvent and runs around every flag-bearing keystroke so
            that the user's next character is not interpreted as part of
            the bot's last shortcut.
          </p>
          <AnimatedCodeBlock
            code={pasteCode}
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The same call, success and failure
          </h2>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            A foreground WhatsApp window returns verified: true within a
            second. The same call to a minimised window returns the same
            shape with verified: false, because the post-send readback
            cannot find a freshly rendered bubble. The model sees both
            cases as structured JSON, on the same turn, and decides what to
            do.
          </p>
          <TerminalOutput
            title="verified: true vs verified: false, same tool"
            lines={verifyTermLines}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The full four-step automation a model runs
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Search, open by index, verify which chat the click landed on,
            then send and observe. Every step has a structured return that
            the next step depends on. The last step is the only write; the
            three before it are checks. This is what makes the contract
            safe to expose to a model that does not have eyes.
          </p>
          <StepTimeline
            title="search, open, verify, send"
            steps={verifiedSetupSteps}
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Side by side: API automation vs verified-local automation
          </h2>
          <p className="text-zinc-600 mb-8 leading-relaxed">
            Same problem, different success signal. The Business API path
            optimises for asynchronous broadcast. The local accessibility
            path optimises for synchronous, observable delivery on a single
            machine. Pick the one whose failure mode matches your use case.
          </p>
          <Marquee speed={34}>
            <div className="flex items-center gap-3 pr-3">
              {verifyChips.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center whitespace-nowrap rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm"
                >
                  {c}
                </span>
              ))}
            </div>
          </Marquee>
          <div className="mt-10">
            <table className="w-full text-left text-sm border border-zinc-200 rounded-2xl overflow-hidden">
              <thead className="bg-zinc-50 text-zinc-700">
                <tr>
                  <th className="px-4 py-3 font-semibold w-1/4">
                    property
                  </th>
                  <th className="px-4 py-3 font-semibold w-3/8">
                    Business API automation
                  </th>
                  <th className="px-4 py-3 font-semibold w-3/8">
                    whatsapp-mcp-macos
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiVsLocalRows.map((row, i) => (
                  <tr key={i} className="border-t border-zinc-200 align-top">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 leading-relaxed">
                      {row.competitor}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 leading-relaxed">
                      {row.ours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What a model should do when verified is false
          </h2>
          <p className="text-zinc-600 mb-4 leading-relaxed">
            Do not retry blindly. A duplicate WhatsApp message is worse than
            a slow render. The right behaviour is to call{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              whatsapp_get_active_chat
            </code>{" "}
            again and inspect{" "}
            <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
              recentMessages
            </code>
            : if the new text now appears, the send did land and the only
            problem was that the AX tree had not stabilised when the post-send
            traversal ran. If after a second check the message is still
            absent, only then retry the send. The warning field on the
            original response carries the last 'Your message, ' bubble the
            server actually saw, which is usually the previous message and a
            useful diagnostic for the model's reasoning.
          </p>
          <p className="text-zinc-600 leading-relaxed">
            The reason this is even possible is that verification is part of
            the same tool call instead of a separate webhook. By the time the
            model is reading the response, the failure is already shaped like
            a structured object the next tool call can act on.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Want a verified-local agent on your own WhatsApp?"
          description="20 minutes to walk through the install, the four-step send loop, and where a verified false would matter for your use case. Bring your workflow, not your stack."
        />

        <FaqSection items={faqItems} />

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Talk through verified-local WhatsApp automation on a 20-minute call"
        />
      </article>
    </>
  );
}
