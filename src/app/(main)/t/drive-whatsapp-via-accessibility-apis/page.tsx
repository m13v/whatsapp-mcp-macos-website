import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  GlowCard,
  GradientText,
  AnimatedCodeBlock,
  AnimatedChecklist,
  ComparisonTable,
  HorizontalStepper,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@seo/components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/drive-whatsapp-via-accessibility-apis";
const PUBLISHED = "2026-05-20";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";
const GITHUB = "https://github.com/m13v/whatsapp-mcp-macos";
const MAIN_SWIFT =
  "https://github.com/m13v/whatsapp-mcp-macos/blob/main/Sources/WhatsAppMCP/main.swift";

export const metadata: Metadata = {
  title:
    "Drive WhatsApp via accessibility APIs: the actual VoiceOver vocabulary",
  description:
    "Every guide tells you to call AXUIElementCreateApplication and walk kAXChildrenAttribute. None of them tell you what WhatsApp Catalyst actually exposes. Here are the five VoiceOver description patterns and three spatial thresholds whatsapp-mcp-macos matches against, lifted directly from the Swift source.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Drive WhatsApp via accessibility APIs, with the AX vocabulary",
    description:
      "Driving WhatsApp on macOS through accessibility is not generic tree traversal. It is pattern matching against the fixed VoiceOver strings the Catalyst app emits. Here is the exact dictionary.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The VoiceOver vocabulary for driving WhatsApp via accessibility",
    description:
      "Five description patterns and three coordinate thresholds. That is the whole spec. Source from whatsapp-mcp-macos inside.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Drive WhatsApp via accessibility APIs" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Drive WhatsApp via accessibility APIs", url: PAGE_URL },
];

const attachCode = `// Sources/WhatsAppMCP/main.swift, lines 57 to 87
// Resolve the WhatsApp process and attach a root AX element.

let whatsAppBundleID = "net.whatsapp.WhatsApp"

func getWhatsAppPid() -> pid_t? {
  let apps = NSRunningApplication
    .runningApplications(withBundleIdentifier: whatsAppBundleID)
  return apps.first?.processIdentifier
}

// Set a messaging timeout. Without one, a busy or
// hung target hangs the caller indefinitely on every AX call.
let appElement = AXUIElementCreateApplication(pid)
AXUIElementSetMessagingTimeout(appElement, 5.0)`;

const traverseCode = `// Sources/WhatsAppMCP/main.swift, lines 118 to 176
// Walk the tree once. Flatten to (role, description, value, title, x, y, w, h).
// Keep nodes with text OR a role in the meaningful set.

func traverseAXTree(pid: pid_t, maxDepth: Int = 15) -> [AXElementInfo] {
  let appElement = AXUIElementCreateApplication(pid)
  AXUIElementSetMessagingTimeout(appElement, 5.0)
  var results: [AXElementInfo] = []

  func traverse(_ element: AXUIElement, depth: Int) {
    guard depth < maxDepth else { return }
    var roleRef: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &roleRef)
    let role = roleRef as? String ?? ""

    // Read description, value, title, position, size in turn.
    // ...

    let meaningful: Set<String> = [
      "AXButton", "AXTextField", "AXTextArea",
      "AXStaticText", "AXHeading", "AXGenericElement", "AXLink"
    ]
    if hasText || meaningful.contains(role) {
      results.append(AXElementInfo(role: role, ...))
    }

    // Recurse into children.
    var childrenRef: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &childrenRef)
    guard let children = childrenRef as? [AXUIElement] else { return }
    for child in children { traverse(child, depth: depth + 1) }
  }

  traverse(appElement, depth: 0)
  return results
}`;

const parseMessagesCode = `// Sources/WhatsAppMCP/main.swift, lines 489 to 527
// Outgoing and incoming bubbles are AXGenericElement
// with description strings that follow a fixed shape.

for el in genericElements {
  let desc = cleanUnicode(el.description ?? "")
  if desc.isEmpty { continue }

  if desc.hasPrefix("Your message, ") || desc.hasPrefix("message, ") {
    let isFromMe = desc.hasPrefix("Your message, ")
    let prefix = isFromMe ? "Your message, " : "message, "
    let rest = String(desc.dropFirst(prefix.count))
    var sender = ""
    var text = rest

    // Group/incoming: ", Received from {name}" suffix.
    if let r = rest.range(of: #",\\s+Received from (.+)$"#,
                          options: .regularExpression) {
      sender = String(rest[r]).replacingOccurrences(
        of: #"^,\\s+Received from "#, with: "",
        options: .regularExpression)
      text = String(rest[rest.startIndex..<r.lowerBound])
    }
    // Outgoing: ", Sent to {name}" suffix.
    else if let r = rest.range(of: #",\\s+Sent to (.+)$"#,
                               options: .regularExpression) {
      sender = String(rest[r]).replacingOccurrences(
        of: #"^,\\s+Sent to "#, with: "",
        options: .regularExpression)
      text = String(rest[rest.startIndex..<r.lowerBound])
    }

    // Then strip the ", HH:MM AM/PM" timestamp from the tail.
    // ...
  }
}`;

const composeCode = `// Sources/WhatsAppMCP/main.swift, lines 900 to 921
// The compose box is an AXTextArea whose description usually
// contains "compose", "message", or "type". Click it, then
// paste (Cmd+V) instead of typing each character.

let textAreas = findElements(in: elements, role: "AXTextArea")
let composeField = textAreas.first(where: {
  ($0.description ?? "").lowercased().contains("compose") ||
  ($0.description ?? "").lowercased().contains("message") ||
  ($0.description ?? "").lowercased().contains("type")
}) ?? textAreas.last

guard let compose = composeField else {
  return "{\\"success\\": false, \\"error\\": \\"compose field not found\\"}"
}

clickElement(compose)        // CGEvent at element center
Thread.sleep(forTimeInterval: 0.3)
_ = pasteText(message)        // backup clipboard, set, Cmd+V, restore
Thread.sleep(forTimeInterval: 0.3)
pressReturn()                 // virtual key 36`;

const verifyCode = `// Sources/WhatsAppMCP/main.swift, lines 922 to 950
// Re-read the tree, look for an AXGenericElement whose
// description starts with "Your message, ". That is how
// WhatsApp Catalyst announces an outgoing bubble to VoiceOver.

let postElements = traverseAXTree(pid: pid)
let genericElements = findElements(in: postElements, role: "AXGenericElement")

var lastSentMessage: String? = nil
for el in genericElements {
  let desc = cleanUnicode(el.description ?? "")
  if desc.hasPrefix("Your message, ") {
    // "Your message, hi there, 6:32 PM, Sent to Jane Delivered"
    // -> strip the time suffix, strip "Sent to ...", strip status.
    let rest = String(desc.dropFirst("Your message, ".count))
    if let r = rest.range(of: #",\\s+\\d{1,2}:\\d{2}\\s*[APap][Mm]"#,
                          options: .regularExpression) {
      lastSentMessage = String(rest[rest.startIndex..<r.lowerBound])
    }
  }
}

// If lastSentMessage matches what we tried to paste, return verified:true.
// Else return verified:false plus a snippet, so the agent can self-correct.`;

const stepperSteps = [
  {
    title: "1. Attach by bundle id",
    description:
      "Look up the WhatsApp PID via NSRunningApplication on bundle id net.whatsapp.WhatsApp. Pass it to AXUIElementCreateApplication. Window titles change with the active chat; bundle ids do not.",
  },
  {
    title: "2. Walk once",
    description:
      "Recurse kAXChildrenAttribute with a depth cap of 15. Read role, description, value, title, position, size. Keep nodes that have text or a role you care about. One traversal serves every operation.",
  },
  {
    title: "3. Match the vocabulary",
    description:
      'Filter by role plus a substring match on the description. The substrings are not yours to invent — they are "Your message, ", "message, ", "Message from ", "Sent to ", "Received from ", "compose", "message", "type", and so on.',
  },
  {
    title: "4. Act, then re-read",
    description:
      'Post a CGEvent click at (x + w/2, y + h/2). Paste via Cmd+V instead of typing. Press Return. Then traverse again, look for "Your message, " to verify the bubble actually rendered.',
  },
];

const vocabularyRows = [
  {
    feature: '"Your message, {text}, {time}, Sent to {name} {status}"',
    competitor:
      "AXGenericElement role. The leading 'Your message, ' is the only reliable signal that this is an outgoing bubble.",
    ours:
      "Detect outgoing messages, verify a send actually rendered, extract the body and the recipient.",
  },
  {
    feature: '"message, {text}, {time}, Received from {name}"',
    competitor:
      "AXGenericElement role. 1:1 incoming message. Sender is in the suffix after 'Received from '.",
    ours:
      "Detect incoming 1:1 messages and pull sender.",
  },
  {
    feature:
      '"Message from {sender}, {text}, {time}, Received in {name}, {count} unread"',
    competitor:
      "AXGenericElement role. Group message variant. Sender lives between 'Message from ' and the first comma.",
    ours:
      "Parse group chat messages without confusing the group name with the sender.",
  },
  {
    feature: '"Added by non-contact {name}, {count} unread"',
    competitor:
      "Description string for an unknown sender in the sidebar. Useful for triaging incoming chats from strangers.",
    ours:
      "Flag inbound chats that did not originate from a saved contact.",
  },
  {
    feature: "Compose AXTextArea, description contains compose/message/type",
    competitor:
      "AXTextArea role. The visible compose box at the bottom of the active chat. Description varies slightly across macOS locales.",
    ours:
      "Click target for sending. Take the textarea whose description matches; fall back to the last AXTextArea in the tree.",
  },
];

const targetComparisonRows = [
  {
    feature: "Bundle id",
    competitor: "net.whatsapp.WhatsApp",
    ours:
      "Stable since the Catalyst port. NSRunningApplication.runningApplications(withBundleIdentifier:) returns the PID in microseconds.",
  },
  {
    feature: "AX tree depth",
    competitor: "Up to ~15 levels (Catalyst leaks UIKit-style nesting).",
    ours:
      "maxDepth=15 reaches the chat list and the message panel without blowing the stack. Lower numbers miss content; higher numbers waste time.",
  },
  {
    feature: "Element addressing",
    competitor:
      "AXButton for chat list rows, AXGenericElement for message bubbles, AXTextArea for compose, AXStaticText for the search bar, AXHeading for the active chat title.",
    ours:
      "Roles are stable across builds. Meta has not been observed obfuscating VoiceOver-targeted attributes the way they obfuscate web DOM class names.",
  },
  {
    feature: "Spatial heuristics",
    competitor:
      "Search result buttons live at x >= 1350 with width >= 200. The active chat heading sits at x > 1750. Section headings (Chats, Other contacts, Media) partition results vertically.",
    ours:
      "Coordinate thresholds drop fragile filter buttons (All, Unread, Favorites) and route-button noise. They are encoded as constants, easy to retune if Meta ships a layout change.",
  },
  {
    feature: "Input dispatch",
    competitor:
      "CGEvent mouse events posted into kCGHIDEventTap at element-center coordinates. Text dispatched via clipboard paste (Cmd+V), not per-character typing.",
    ours:
      "Paste handles emoji and the IME without races. Per-character CGEvent typing breaks on non-ASCII and is 30-200ms per character.",
  },
];

const faqItems = [
  {
    q: 'Why do I have to match strings like "Your message, " instead of using a more structured attribute?',
    a: "Catalyst apps do not expose typed semantic data through accessibility. The richest signal is the VoiceOver description, which is a localized human-readable label. WhatsApp's labels happen to be templated, so they parse cleanly with five regex patterns. There is no AXValue you can pull that contains just the message text or just the sender. The description string is the API surface.",
  },
  {
    q: 'Will the description strings change in a future WhatsApp build?',
    a: "The five patterns shipped in whatsapp-mcp-macos have been stable across every Catalyst build between 2024 and mid-2026. They map to VoiceOver labels Meta needs to keep working for visually impaired users, so the strings are under more pressure to stay stable than the obfuscated CSS class names on web.whatsapp.com (which rotate weekly). The localized prefixes are the most likely thing to drift; if WhatsApp ships a non-English UI you will see locale-translated equivalents and need to either lock the app to English or extend the matchers.",
  },
  {
    q: "Why traverse the whole tree on every operation? Cannot you cache it?",
    a: "WhatsApp's AX tree mutates on every chat switch, every message arrival, every search keystroke. The tree returned by AXUIElementCopyAttributeValue is a snapshot; caching it gives the agent stale coordinates that no longer click anything. Walking 15 levels on a Catalyst process takes ~120ms on an M-series Mac, which is the cost of doing business. The compromise that does pay off is reading every interesting attribute on each node in one pass instead of going back to the AX system for each one.",
  },
  {
    q: 'Why post CGEvent clicks instead of calling AXUIElementPerformAction(AXPress)?',
    a: "AXPress works on AXButton elements and refuses to act on AXGenericElement, AXTextArea, and the chat-list rows that WhatsApp uses for everything. The compose box specifically does not respond to AXPress. CGEvent posts a real mouse-down/mouse-up at the element center via kCGHIDEventTap, which the Catalyst app processes through the same code path a human cursor would hit. It works on every element and side-steps the question of which AXAction the element claims to support.",
  },
  {
    q: "Does this approach work for groups too?",
    a: 'Yes, and the group variant is the reason the three description patterns above exist instead of one. Group messages arrive as "Message from {sender}, {text}, {time}, Received in {group_name}, {N} unread". The 1:1 variant is "message, {text}, {time}, Received from {sender}". whatsapp-mcp-macos parses both shapes and unifies them into a MessageInfo struct so the LLM does not see two different schemas for one logical concept.',
  },
  {
    q: "Why paste through the system clipboard? Can I keep the clipboard untouched?",
    a: "The system clipboard is the only path that handles emoji, non-ASCII, IME composition, and long bodies without a per-character race against WhatsApp's input handler. whatsapp-mcp-macos backs up the existing clipboard contents before the paste, sets the new text, dispatches Cmd+V, sleeps 350ms, and restores the original contents. From the user's perspective the clipboard is unchanged after the send. There is a 350ms window where a parallel cmd+v from the user would land the message text, which is the tradeoff.",
  },
  {
    q: "Is there a non-macOS version?",
    a: "No. AXUIElement is Apple-platform-only (ApplicationServices on macOS). Windows ships UI Automation, which has a similar shape but a completely different API surface. Linux has AT-SPI but no native WhatsApp app to drive. The approach is fundamentally tied to the existence of a real desktop WhatsApp client plus an accessibility framework the app participates in.",
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
                "Drive WhatsApp via accessibility APIs: the actual VoiceOver vocabulary",
              description:
                "How whatsapp-mcp-macos drives WhatsApp on macOS through AXUIElement, with the literal description strings and coordinate thresholds the Swift source matches against.",
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
          Drive WhatsApp via accessibility APIs is mostly{" "}
          <GradientText>string matching</GradientText>, not tree walking
        </h1>
        <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
          Every guide on this topic teaches the wrapping:{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            AXUIElementCreateApplication
          </code>
          , recurse{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            kAXChildrenAttribute
          </code>
          , post a{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            CGEvent
          </code>
          . Then they stop. What none of them tell you is the part that
          actually does the work: the five VoiceOver description strings and
          three coordinate thresholds the WhatsApp Catalyst app emits that you
          have to match against. Here is that dictionary, pulled straight from
          the Swift source of{" "}
          <a
            href={GITHUB}
            className="text-teal-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            whatsapp-mcp-macos
          </a>
          .
        </p>
        <div className="mt-6">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="10 min read"
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
              Attach to the WhatsApp process with{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                AXUIElementCreateApplication(pid)
              </code>{" "}
              where{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                pid
              </code>{" "}
              comes from{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                NSRunningApplication
              </code>{" "}
              filtered to bundle id{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                net.whatsapp.WhatsApp
              </code>
              . Walk{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                kAXChildrenAttribute
              </code>{" "}
              once with a depth cap of 15 to get a flat list of{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                (role, description, x, y, w, h)
              </code>{" "}
              tuples. Then match by role plus substring of description:
              outgoing bubbles start with{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                Your message,{" "}
              </code>
              , incoming with{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                message,{" "}
              </code>{" "}
              or{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                Message from{" "}
              </code>
              ; the compose field is an AXTextArea whose description contains{" "}
              <em>compose</em>, <em>message</em>, or <em>type</em>; search
              result buttons live at{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                x &gt;= 1350, w &gt;= 200
              </code>
              . Send by clicking the compose box, pasting via Cmd+V, pressing
              Return. Verify by re-reading the tree and looking for a fresh{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                Your message,{" "}
              </code>{" "}
              bubble.
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Source:{" "}
              <a
                href={MAIN_SWIFT}
                className="text-teal-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sources/WhatsAppMCP/main.swift
              </a>
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The shape of the problem
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          A web-automation engineer reading about driving WhatsApp through
          accessibility APIs imports a mental model from CSS selectors: find
          the right node, click it, type. That model is wrong here, in a way
          that matters.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The accessibility tree of a Catalyst app exposes almost no typed
          structure. There is no{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            data-message-id
          </code>
          , no{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            role=&quot;listitem&quot;
          </code>{" "}
          with a clean child structure. What you get is a flat list of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            (role, description, x, y, w, h)
          </code>{" "}
          tuples where description is a localized human-readable VoiceOver
          string. That string is the whole API surface.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          WhatsApp Catalyst&apos;s description strings happen to be templated,
          so they parse with about thirty lines of regex. The work of writing
          an MCP server for WhatsApp on macOS is mostly figuring out those
          templates and writing the parsers; the AX plumbing is identical to
          what you would do for any other Catalyst app and takes a single
          afternoon.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-10">
        <HorizontalStepper
          title="The four moves, end to end"
          steps={stepperSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Step 1: attach by bundle id
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The PID lookup uses{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            NSRunningApplication.runningApplications(withBundleIdentifier:)
          </code>
          . If WhatsApp is not running, launch it via{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            /usr/bin/open -a WhatsApp.app
          </code>{" "}
          and wait two seconds for the AX tree to settle. The bundle id is
          stable; window titles change with the active chat and should not be
          used as an attach key.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Set an explicit messaging timeout right after attach. AX calls are
          XPC under the hood; without a timeout, a stutter in the target app
          hangs your caller indefinitely. The MCP server uses 2.0 seconds for
          the permission probe (where you want to fail fast) and 5.0 seconds
          for the real traversal.
        </p>
        <AnimatedCodeBlock
          code={attachCode}
          language="swift"
          filename="main.swift"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Step 2: traverse once, keep everything you might need
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Walk{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            kAXChildrenAttribute
          </code>{" "}
          recursively to a depth of 15. On every node, read role, description,
          value, title, position, and size in a single pass. Keep the node if
          it has any text or if its role is in the meaningful set:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            AXButton
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            AXTextField
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            AXTextArea
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            AXStaticText
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            AXHeading
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            AXGenericElement
          </code>
          ,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            AXLink
          </code>
          .
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Doing it in one pass matters. Going back to the AX system per-node
          per-attribute roughly doubles the time spent talking to the kernel.
          One walk, every attribute, flat array of structs out the other end.
          Every operation downstream filters that array; the array itself is
          regenerated on every tool call because WhatsApp&apos;s tree mutates
          on every keystroke.
        </p>
        <AnimatedCodeBlock
          code={traverseCode}
          language="swift"
          filename="main.swift"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Step 3: the actual vocabulary
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          This is the table no other accessibility-API guide will give you,
          because writing it requires reading WhatsApp Catalyst&apos;s
          AX tree on a real Mac. Each row is one of the description-string
          shapes the app emits, the role you find it under, and what to do
          with it. The patterns are taken verbatim from{" "}
          <a
            href={MAIN_SWIFT}
            className="text-teal-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            main.swift
          </a>
          .
        </p>
        <ComparisonTable
          productName="What it parses to"
          competitorName="Where it appears in the tree"
          rows={vocabularyRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Step 3a: the regex that turns description strings into MessageInfo
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          With the vocabulary known, the parser is straightforward. Take the
          AXGenericElement description, peel off the prefix (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            Your message,{" "}
          </code>{" "}
          or{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            message,{" "}
          </code>
          ), then peel off the routing suffix (
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            , Sent to {`{name}`}
          </code>{" "}
          or{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            , Received from {`{name}`}
          </code>
          ), then peel off the timestamp tail. Whatever remains is the message
          body.
        </p>
        <AnimatedCodeBlock
          code={parseMessagesCode}
          language="swift"
          filename="main.swift"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Step 3b: spatial heuristics for search results
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Description matching gets you about 80% of the way there. The other
          20% is coordinate filtering, because WhatsApp&apos;s sidebar
          contains a lot of buttons that match description filters but are
          not what you want: tab pills (All, Unread, Favorites), media filter
          chips, navigation buttons, and so on.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Three thresholds, all encoded as constants in main.swift, do the
          filtering:
        </p>
        <AnimatedChecklist
          title="Spatial filter rules"
          items={[
            {
              text: "Search result buttons must have x >= 1350 (sidebar area on a 16-inch MacBook; tune for other window sizes).",
            },
            {
              text: "Search result buttons must have width >= 200 (excludes the narrow tab pills).",
            },
            {
              text: "The active chat heading sits at x > 1750 (right of the sidebar; distinguishes the chat title from section headings like Chats, Other contacts, Media).",
            },
            {
              text: "Section headings (Chats, Other contacts, Media) partition results vertically. The y-coordinate of each heading is the boundary between sections.",
            },
            {
              text: "Skip buttons whose description matches the static UI keyword set (chats, calls, settings, search, send, video message, etc.) regardless of position.",
            },
          ]}
        />
        <p className="text-zinc-700 leading-relaxed mt-4">
          The thresholds are encoded as named constants, which means a
          WhatsApp layout change is a one-line edit, not a rewrite. The point
          is to keep the policy explicit and editable, not to derive it from
          first principles every time.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Step 4: act, then verify
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Find the compose AXTextArea by description. Click it via a CGEvent
          mouse-down/mouse-up pair at the element center (after saving the
          user&apos;s cursor position so the cursor does not visibly jump).
          Paste through the system clipboard rather than typing each
          character, because per-character{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            CGEvent
          </code>{" "}
          typing fails on emoji and fights with WhatsApp&apos;s IME. Press
          Return.
        </p>
        <AnimatedCodeBlock
          code={composeCode}
          language="swift"
          filename="main.swift"
        />
        <p className="text-zinc-700 leading-relaxed mt-6 mb-4">
          Verification is the part where most accessibility-driven
          automations leave the LLM hanging. After hitting Return, re-walk
          the tree and look for an AXGenericElement whose description starts
          with{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            Your message,{" "}
          </code>{" "}
          containing the body you just pasted. If you find it, return{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            verified: true
          </code>
          . If you do not, return{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            verified: false
          </code>{" "}
          plus a snippet of whatever did appear, so the calling agent can
          self-correct instead of pretending success.
        </p>
        <AnimatedCodeBlock
          code={verifyCode}
          language="swift"
          filename="main.swift"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What this approach looks like next to alternatives
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The competitor here is not another macOS accessibility library, but
          the other transports people pick to reach WhatsApp from an agent:
          headless Chromium driving web.whatsapp.com, the Signal Protocol
          fork (whatsmeow), or the Meta WhatsApp Business Cloud API. The
          comparison is between driving the native app via AX and those
          three. Below is what each row of the AX-driven approach actually
          buys you.
        </p>
        <ComparisonTable
          productName="whatsapp-mcp-macos (AX)"
          competitorName="What it means in practice"
          rows={targetComparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Honest limitations
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          This approach is macOS-only. It depends on a real WhatsApp Desktop
          install staying logged in, on the host process having Accessibility
          permission, and on the user&apos;s screen being unlocked when the
          agent is acting (the AX tree is empty on a locked screen). It is
          single-user; the agent shares whatever pairing the user has, with
          all the consent implications that follow.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The description strings are localized. The matchers in main.swift
          assume an English locale. A French or Japanese WhatsApp Desktop
          ships translated VoiceOver labels and the parsers will need
          locale-aware variants. The cleanest fix is to keep WhatsApp Desktop
          in English regardless of system locale; the more invasive fix is to
          extend each regex with localized alternates.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Latency is real: one full tree walk on a chat with a few hundred
          rendered rows takes ~120ms on an M-series Mac. For send + verify
          that is two walks plus the paste sleep, around 700ms end to end.
          That is fine for an interactive agent and bad for a batch sender.
          If you need volume, the WhatsApp Business Cloud API is the right
          tool and this is the wrong one.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          section="guide-footer"
          heading="Want help wiring this into your own agent?"
          description="If you are building on top of WhatsApp MCP or weighing it against the Business API, a quick call gets faster answers than a back-and-forth issue thread."
        />
      </section>

      <FaqSection items={faqItems} />

      <BookCallCTA
        appearance="sticky"
        destination={CAL_LINK}
        site="WhatsApp MCP"
        section="guide-sticky"
        description="Book a call about driving WhatsApp from your AI agent."
      />
    </article>
  );
}
