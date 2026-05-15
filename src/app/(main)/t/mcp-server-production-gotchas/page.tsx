import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  AnimatedChecklist,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@seo/components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/mcp-server-production-gotchas";
const PUBLISHED = "2026-05-15";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "MCP server production gotchas: nine that bit me shipping a real local one",
  description:
    "Every 'MCP server in production' post I read was HTTP advice in disguise. These are the actual gotchas a stdio MCP server hits when it drives a real app: TCC reports trusted while AX calls silently return nothing, hung accessibility calls without a 5.0 second timeout, stuck Cmd flags after a CGEvent post, success:true from a send that never reached the wire.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "MCP server production gotchas (the local-stdio kind)",
    description:
      "Nine gotchas a stdio MCP server actually hits in production, with line numbers from the WhatsApp MCP source: stale TCC trust, hung AX calls, stuck modifier flags, clipboard races, post-send verification.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCP server production gotchas",
    description:
      "Nine real ones, with line numbers. TCC stale trust, hung AX calls, stuck Cmd flags, clipboard race, post-send verification. Stdio not HTTP.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "MCP server production gotchas" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "MCP server production gotchas", url: PAGE_URL },
];

const tccProbeCode = `// Sources/WhatsAppMCP/main.swift, line 562 to 572
func requireAccessibility() -> String? {
    let trusted = AXIsProcessTrustedWithOptions(
        [kAXTrustedCheckOptionPrompt.takeRetainedValue(): false]
            as CFDictionary
    )
    if trusted { return nil }
    return serializeToJsonString([
        "error": "Accessibility permission not granted. ...",
        "fix": "Open System Settings > Privacy & Security > Accessibility ...",
        "accessibilityTrusted": "false"
    ]) ?? "{\\"error\\": \\"Accessibility permission not granted.\\"}"
}

// Sources/WhatsAppMCP/main.swift, line 576 to 582
// Functional probe: actually try to read the AX tree.
// AXIsProcessTrusted can return true while AX calls silently fail.
func probeAccessibility(pid: pid_t) -> Bool {
    let appElement = AXUIElementCreateApplication(pid)
    AXUIElementSetMessagingTimeout(appElement, 2.0)
    var childrenRef: CFTypeRef?
    let result = AXUIElementCopyAttributeValue(
        appElement, kAXChildrenAttribute as CFString, &childrenRef
    )
    return result == .success && childrenRef != nil
}`;

const axTimeoutCode = `// Sources/WhatsAppMCP/main.swift, line 118 to 122
func traverseAXTree(pid: pid_t, maxDepth: Int = 15) -> [AXElementInfo] {
    let appElement = AXUIElementCreateApplication(pid)
    AXUIElementSetMessagingTimeout(appElement, 5.0)
    var results: [AXElementInfo] = []
    // ... walks the AX tree by role, description, value, title, position
}`;

const stuckFlagsCode = `// Sources/WhatsAppMCP/main.swift, line 239 to 263
func sendKeyEvent(keyCode: CGKeyCode, flags: CGEventFlags = []) {
    let source = CGEventSource(stateID: .hidSystemState)
    if flags.isEmpty {
        // Clear any modifier that another process left held down.
        for code: CGKeyCode in [55, 56, 58, 59] { // Cmd, Shift, Option, Control
            let up = CGEvent(keyboardEventSource: source, virtualKey: code, keyDown: false)
            up?.post(tap: .cghidEventTap)
        }
        Thread.sleep(forTimeInterval: 0.05)
    }
    let down = CGEvent(keyboardEventSource: source, virtualKey: keyCode, keyDown: true)
    let up = CGEvent(keyboardEventSource: source, virtualKey: keyCode, keyDown: false)
    if !flags.isEmpty {
        down?.flags = flags
        up?.flags = flags
    }
    down?.post(tap: .cghidEventTap)
    up?.post(tap: .cghidEventTap)
    if !flags.isEmpty {
        // Same dance afterwards: release every modifier explicitly so the next
        // key the user types is not Cmd-prefixed.
        for code: CGKeyCode in [55, 56, 58, 59] {
            let up = CGEvent(keyboardEventSource: source, virtualKey: code, keyDown: false)
            up?.post(tap: .cghidEventTap)
        }
        Thread.sleep(forTimeInterval: 0.05)
    }
}`;

const clipboardCode = `// Sources/WhatsAppMCP/main.swift, line 225 to 237
func pasteText(_ text: String) -> Bool {
    let pb = NSPasteboard.general
    let backup = pb.string(forType: .string)
    pb.clearContents()
    guard pb.setString(text, forType: .string) else { return false }
    sendKeyEvent(keyCode: 9, flags: .maskCommand) // Cmd+V
    Thread.sleep(forTimeInterval: 0.35)
    pb.clearContents()
    if let backup = backup {
        _ = pb.setString(backup, forType: .string)
    }
    return true
}`;

const cursorCode = `// Sources/WhatsAppMCP/main.swift, line 195 to 218
func saveCursorPosition() -> CGPoint? {
    let nsPos = NSEvent.mouseLocation
    guard let primaryScreen = NSScreen.screens.first else { return nil }
    return CGPoint(x: nsPos.x, y: primaryScreen.frame.height - nsPos.y)
}

func restoreCursorPosition(_ pos: CGPoint) {
    if let moveEvent = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved,
                               mouseCursorPosition: pos, mouseButton: .left) {
        moveEvent.post(tap: .cghidEventTap)
    }
}

func clickAt(x: Double, y: Double) {
    let savedPos = saveCursorPosition()
    let point = CGPoint(x: x, y: y)
    // ... mouseDown, mouseUp at point
    if let savedPos = savedPos {
        restoreCursorPosition(savedPos)
    }
}`;

const verifySendCode = `// Sources/WhatsAppMCP/main.swift, line 924 to 957 (handleSendMessage tail)
// Post-send verification: traverse AX again, find the latest
// "Your message, ..." element, compare against what we just pasted.
let postElements = traverseAXTree(pid: pid)
let genericElements = findElements(in: postElements, role: "AXGenericElement")

var lastSentMessage: String? = nil
for el in genericElements {
    let desc = cleanUnicode(el.description ?? "")
    if desc.hasPrefix("Your message, ") {
        let rest = String(desc.dropFirst("Your message, ".count))
        var text = rest
        if let timeRange = text.range(of: #",\\s+\\d{1,2}:\\d{2}\\s*[APap][Mm]"#,
                                     options: .regularExpression) {
            text = String(text[text.startIndex..<timeRange.lowerBound])
        }
        lastSentMessage = text.trimmingCharacters(in: CharacterSet(charactersIn: ", "))
    }
}

let verified: Bool
if let lastSent = lastSentMessage {
    let sentNormalized = lastSent.lowercased().trimmingCharacters(in: .whitespaces)
    let msgNormalized = message.lowercased().trimmingCharacters(in: .whitespaces)
    verified = sentNormalized.hasPrefix(msgNormalized)
        || msgNormalized.hasPrefix(sentNormalized)
        || sentNormalized.contains(msgNormalized)
} else {
    verified = false
}

if verified {
    return "{\\"success\\": true, \\"verified\\": true, ...}"
} else {
    return "{\\"success\\": true, \\"verified\\": false, ..., " +
           "\\"warning\\": \\"Could not verify message appeared in chat. ...\\"}"
}`;

const unicodeCleanCode = `// Sources/WhatsAppMCP/main.swift, line 49 to 53
func cleanUnicode(_ s: String) -> String {
    s.replacingOccurrences(
        of: "[\\u{200e}\\u{200f}\\u{200b}\\u{200c}\\u{200d}\\u{2066}\\u{2067}\\u{2068}\\u{2069}\\u{202a}\\u{202b}\\u{202c}\\u{202d}\\u{202e}]",
        with: "", options: .regularExpression
    )
}`;

const scrollLoopCode = `// Sources/WhatsAppMCP/main.swift, line 866 to 870
// Scroll multiple times for reliability, WhatsApp lazy-loads incrementally.
for _ in 0..<3 {
    scrollAt(x: scrollX, y: scrollY, deltaY: delta)
    Thread.sleep(forTimeInterval: 0.3)
}
Thread.sleep(forTimeInterval: 0.3)`;

const quitCode = `// Sources/WhatsAppMCP/main.swift, line 626 to 646
func handleQuit() -> String {
    guard getWhatsAppPid() != nil else {
        return "{\\"success\\": true, \\"was_running\\": false}"
    }
    quitWhatsApp()
    // Wait up to 5 seconds for graceful quit
    for _ in 0..<10 {
        Thread.sleep(forTimeInterval: 0.5)
        if getWhatsAppPid() == nil {
            return "{\\"success\\": true, \\"was_running\\": true}"
        }
    }
    // Force quit if still running
    let apps = NSRunningApplication
        .runningApplications(withBundleIdentifier: whatsAppBundleID)
    for app in apps {
        app.forceTerminate()
    }
    Thread.sleep(forTimeInterval: 1.0)
    let stillRunning = getWhatsAppPid() != nil
    return "{\\"success\\": \\(!stillRunning), \\"was_running\\": true, \\"force_quit\\": true}"
}`;

const statusTerminalLines = [
  {
    type: "command" as const,
    text: 'echo \'{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"whatsapp_status"}}\' | whatsapp-mcp',
  },
  {
    type: "output" as const,
    text:
      '{"accessibilityTrusted":"true","accessibilityWorking":"false",',
  },
  {
    type: "output" as const,
    text:
      ' "pid":"38217","whatsappRunning":"true",',
  },
  {
    type: "output" as const,
    text:
      ' "warning":"Accessibility reports trusted but AX calls are failing.',
  },
  {
    type: "output" as const,
    text:
      '   This is common after macOS updates or app re-signing. Try removing',
  },
  {
    type: "output" as const,
    text:
      '   and re-adding the app in System Settings > Privacy & Security >',
  },
  {
    type: "output" as const,
    text: '   Accessibility, then restart the app."}',
  },
  {
    type: "info" as const,
    text:
      "// The model now has a concrete fix to suggest, instead of a green light.",
  },
];

const checklistItems = [
  {
    text:
      "Trust the trust check. AXIsProcessTrustedWithOptions(prompt: false) can return true while every subsequent AX call returns nothing. Always probe.",
    checked: false,
  },
  {
    text:
      "Block forever on an AX call. AXUIElementCopyAttributeValue does not time out by default, set AXUIElementSetMessagingTimeout(elem, 5.0) on the app element.",
    checked: false,
  },
  {
    text:
      "Leave Cmd held down. After Cmd+V the user's next key is Cmd-prefixed unless you explicitly post key-up events for keycodes 55, 56, 58, 59.",
    checked: false,
  },
  {
    text:
      "Stomp the clipboard. If you Cmd+V, back the old clipboard up and restore it within the same call, or you just deleted whatever the human was about to paste.",
    checked: false,
  },
  {
    text:
      "Warp the cursor. CGEvent mouse events move the real pointer, save NSEvent.mouseLocation before the click and restore it after.",
    checked: false,
  },
  {
    text:
      "Return success:true from a send tool. Walking the AX tree after Return and finding 'Your message, <text>' is the only honest verification.",
    checked: false,
  },
  {
    text:
      "Trust the first read of a lazy list. WhatsApp's sidebar lazy-loads, scroll three times with a sleep between each before declaring 'no results'.",
    checked: false,
  },
  {
    text:
      "Forget bidirectional Unicode. AX descriptions contain U+200E, U+200F, and the U+2066-2069 isolates, strip them before any prefix/contains compare.",
    checked: false,
  },
  {
    text:
      "Send terminate and assume the process is gone. Loop ten times at 0.5s then forceTerminate. The MCP client is waiting for one JSON line, don't make it hang.",
    checked: true,
  },
  {
    text:
      "Return JSON the model can act on. 'Permission not granted' is a dead end. 'Permission not granted, here is the System Settings pane to open' is a tool call.",
    checked: true,
  },
];

const faqItems = [
  {
    q: "Why don't generic 'MCP server in production' guides cover any of this?",
    a: "Most of them assume the MCP server is a thin HTTP wrapper around a SaaS API, so the production playbook is the SaaS playbook: secrets in a vault, retries with exponential backoff, structured logs, rate-limit handling, OpenTelemetry. None of that is wrong for a remote MCP server, but it is irrelevant to a local stdio MCP that drives a real app on the user's machine. The gotchas there live one layer down, in the OS surface the MCP touches: permission daemons, event taps, window servers, lazy-loaded UI. The WhatsApp MCP I ship is a Swift binary that gets forked by Claude Code with type stdio, and every interesting bug in its first month was at that layer, not the JSON-RPC layer.",
  },
  {
    q: "What is the worst of the nine, in practice?",
    a: "Silent permission failure. AXIsProcessTrustedWithOptions returns true, the menu bar shows the host app with a check next to it in Accessibility, and AXUIElementCopyAttributeValue still returns kAXErrorCannotComplete or just an empty result. This happens after macOS minor updates and after the host app is re-signed (which Claude Code does on every release). The user sees the MCP look healthy in whatsapp_status, then sees every other tool return mysterious empty results. The defense is the functional probe at line 576 of main.swift, which actually pulls the children of the app element with a 2 second timeout and surfaces a 'TCC stale' warning. Without it the user has no idea where to look.",
  },
  {
    q: "Why is AXUIElementSetMessagingTimeout 5.0 seconds and not 1.0?",
    a: "Because the AX tree of a Catalyst app on a busy machine genuinely takes that long sometimes. 1.0 second is fine when WhatsApp Desktop is idle and forward, but the same call against a backgrounded WhatsApp on a Mac under heavy load (Spotlight reindex, an iCloud sync storm, a Time Machine snapshot) routinely needs 2 to 3 seconds. 5.0 is the empirical floor where the timeout becomes a real error signal, not a flaky one. The probe (line 578) uses 2.0 because it is only walking one level, just children of the app element. The full traversal at line 120 is 5.0 because it walks up to fifteen levels deep.",
  },
  {
    q: "Is the stuck-modifier flag really a thing or are you being paranoid?",
    a: "It is real. CGEvent posts a key-down with flags set, and on macOS the flags are sticky from the kernel's perspective until something explicitly releases them. If the next CGEvent your code or the user's keyboard posts does not carry the same flag, the OS sees a Cmd-modified keystroke. I shipped a build once that did not release modifiers after a Cmd+A in the search field, and the user's next typed character was treated as Cmd+<char>, which scrolled their browser, opened a new tab in Terminal, and did roughly nothing the user wanted. The fix is the bracketed key-up dance at the top and bottom of sendKeyEvent (line 239 to 263), explicitly posting key-up for keycodes 55, 56, 58, and 59 with a 50ms sleep so the kernel registers them.",
  },
  {
    q: "Why post-send verification instead of just trusting Return?",
    a: "Because Return only worked if the compose textarea was focused, the message text actually reached it, no autocorrect modal stole focus mid-paste, and WhatsApp did not silently reject the input because the chat header changed under us. Each of those failure modes happened in early builds. The honest answer is to walk the AX tree after pressing Return, find AXGenericElement nodes whose description starts with 'Your message, ', strip the time suffix, and compare against the input. Even then I return success:true with verified:false rather than success:false, because the message may have been sent but rendered without an AX-readable description, and a hard fail would tell the model to retry, which double-sends.",
  },
  {
    q: "How does this interact with the MCP protocol itself?",
    a: "All of these gotchas are below the protocol. The MCP layer sees clean JSON-RPC over stdio: a CallTool request comes in, a JSON string goes out. The protocol gotchas (timeouts on the host side, listChanged notifications, schema validation of tool inputs) are real but well-covered in modelcontextprotocol.io's own docs. The OS-binding gotchas in this page only show up when your MCP server actually does something to the machine. If your MCP is a fetch wrapper, none of this applies. If it's a local stdio binary that drives a real app, all of it does.",
  },
  {
    q: "Why force-terminate after only 5 seconds in the quit tool?",
    a: "Because the MCP client (Claude Code, Cursor, whatever) is waiting for one JSON line in response to the tool call and most clients have their own tool-call timeout in the 10 to 30 second range. If whatsapp_quit hangs for 10 seconds waiting for a polite shutdown, the client times out, decides the MCP is broken, and the user gets a 'tool execution failed' error even though the kill succeeded a moment later. 5 seconds of grace then NSRunningApplication.forceTerminate is the right trade. The success field tells the model whether force-quit was necessary, so a downstream tool call can react.",
  },
  {
    q: "What's the closest thing to all of this for non-macOS local MCP servers?",
    a: "The pattern is the same wherever a local MCP drives a real binary or UI: there is always a permission layer that lies (Linux's seccomp profile, Windows' UI Automation trust), there is always a remote call that hangs without an explicit timeout, there is always a UI surface that returns stale state if you read it once instead of polling, and there is always a tool that needs post-action verification because the OS does not bubble up its errors synchronously. The accessibility-API specifics on this page are macOS, the failure shapes are universal.",
  },
];

const ldJsonArticle = JSON.stringify(
  articleSchema({
    url: PAGE_URL,
    headline:
      "MCP server production gotchas: nine that bit me shipping a real local one",
    description:
      "Nine gotchas a stdio MCP server actually hits in production, with line numbers from the WhatsApp MCP source.",
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
          MCP server production gotchas, the local-stdio kind
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-zinc-600">
          Every &quot;MCP server in production&quot; post I read while building
          one was secretly HTTP advice: rate limits, vaulted secrets, retries
          with backoff, OpenTelemetry. Fine for a remote MCP. Useless for a
          local stdio MCP that actually does something to the machine. Below are
          nine gotchas that bit me shipping{" "}
          <a
            className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
            href="https://github.com/m13v/whatsapp-mcp-macos"
          >
            whatsapp-mcp-macos
          </a>
          , a Swift binary that drives the native WhatsApp Catalyst app through
          accessibility APIs, with the line numbers from{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
            Sources/WhatsAppMCP/main.swift
          </code>
          .
        </p>
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />
      </header>

      <section className="mx-auto max-w-3xl px-4 py-4">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-teal-700">
            Direct answer
          </p>
          <p className="mt-2 text-base leading-relaxed text-zinc-800">
            For a local stdio MCP that drives a real app, &quot;production&quot;
            does not break at JSON-RPC. It breaks at the OS surface: TCC reports
            the host as trusted while AX calls silently return nothing, an
            accessibility call hangs without a timeout, a Cmd flag stays held
            down after a CGEvent post, the clipboard gets stomped, the cursor
            warps, and the send tool returns{" "}
            <code className="text-sm">success:true</code> for a message that
            never reached the wire. Everything below is one of those.
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Verified against{" "}
            <code className="text-xs">Sources/WhatsAppMCP/main.swift</code> on{" "}
            2026-05-15. 1,214 lines, 11 MCP tools, AX timeout 5.0s.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          1. TCC says trusted, AX calls return nothing
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The accessibility permission check on macOS is{" "}
          <code className="text-sm">AXIsProcessTrustedWithOptions</code>. It
          asks the TCC daemon whether the calling process is in the
          Accessibility allowlist. The daemon often answers yes when the actual
          permission to read another app&apos;s AX tree is broken, because TCC
          and the AX subsystem cache their views of the world separately.
        </p>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          I see this most after macOS minor updates and after the host app
          (Claude Code, Cursor, Fazm) is re-signed. The Accessibility pane shows
          a checkmark next to the host, the trust check returns true, and every
          downstream call to{" "}
          <code className="text-sm">AXUIElementCopyAttributeValue</code> returns
          empty arrays or{" "}
          <code className="text-sm">kAXErrorCannotComplete</code>. The fix is
          not to fight TCC. It is to never trust the trust check alone.
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={tccProbeCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          Two checks, not one. The trust check is cheap and runs first.{" "}
          <code className="text-sm">probeAccessibility</code> actually pulls the
          children of the running app element with a 2-second timeout. If trust
          is true but the probe fails, the server emits a status that says so,
          out loud, with a fix:
        </p>

        <div className="mt-5">
          <TerminalOutput lines={statusTerminalLines} title="whatsapp_status" />
        </div>

        <p className="mt-4 text-zinc-700 leading-relaxed">
          The model on the other side now has something it can act on instead of
          a green light it has to second-guess.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          2. AX calls hang forever without an explicit timeout
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The default timeout on{" "}
          <code className="text-sm">AXUIElementCopyAttributeValue</code> is, in
          practice, &quot;until the target process responds.&quot; If the target
          is frozen, paging in, mid-launch, or held by a system service, the
          call blocks the calling thread. Inside a synchronous MCP tool handler,
          that means the JSON-RPC response never goes out, and the MCP client
          eventually times out the whole tool call.
        </p>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          <code className="text-sm">AXUIElementSetMessagingTimeout(elem, 5.0)</code>
          {" "}fixes this. Apply it once to the application element at the start
          of every traversal:
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={axTimeoutCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          5.0 sounds long. It is the empirical floor. WhatsApp Desktop under a
          Spotlight reindex routinely needs 2 to 3 seconds. The 2.0-second
          timeout on the probe is shorter because the probe only asks for the
          children of one element, not a fifteen-level descent.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          3. Cmd stays held down after a CGEvent post
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          To paste, the server posts <code className="text-sm">Cmd+V</code> as a
          synthetic CGEvent with{" "}
          <code className="text-sm">CGEventFlags.maskCommand</code>. The kernel
          treats those flags as sticky until something explicitly releases them.
          If the next key the user types arrives before any unmodified CGEvent
          clears the flag, the OS reads it as{" "}
          <code className="text-sm">Cmd+&lt;char&gt;</code>. Browser tabs close.
          Terminal opens new windows. Files get archived.
        </p>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The defense is a bracketed key-up dance: before and after every
          modified send, post explicit key-up events for keycodes 55, 56, 58,
          and 59 (Cmd, Shift, Option, Control) so the kernel registers them as
          released.
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={stuckFlagsCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The 50ms sleep is not aesthetic. Without it, the rapid sequence of
          key-up events arrives before the prior key-down has been fully
          dispatched, and macOS drops some of the releases.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          4. Cmd+V stomps the clipboard the user was holding
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The most reliable way to type Unicode into a Catalyst text field from
          the outside is to write the string to{" "}
          <code className="text-sm">NSPasteboard.general</code> and post Cmd+V.
          The first version of the send tool did that, and the first user bug
          was a developer complaining that their carefully prepared 800-word
          paste buffer was gone every time Claude messaged a contact.
        </p>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Back up, paste, restore, in the same function:
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={clipboardCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          Two gotchas live inside this fix.{" "}
          <code className="text-sm">pb.string(forType: .string)</code> only
          backs up the plaintext representation, so a clipboard holding an
          image, PDF, or RTF payload still gets replaced with text. And the
          0.35-second sleep before clear-and-restore is mandatory, because
          WhatsApp&apos;s Cmd+V handler reads the pasteboard asynchronously and
          will paste empty if you clear too soon.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          5. CGEvent mouse clicks warp the real cursor
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          A synthetic click at <code className="text-sm">(1820, 540)</code>{" "}
          moves the actual pointer to (1820, 540). The user&apos;s cursor jumps,
          their hover state changes, and if they happen to be mid-drag the drag
          ends in the wrong place. Save the position before the click and post
          a mouse-moved event back to the original location afterwards.
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={cursorCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The Y axis flip in <code className="text-sm">saveCursorPosition</code>
          {" "}is the macOS convention: NSEvent uses bottom-left origin,
          CGEvent uses top-left. The conversion has to happen exactly once. A
          missed or duplicated flip parks the restored cursor at the wrong end
          of the screen and looks identical to no restore at all.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          6. The send tool returns success:true for messages that never sent
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The naive send is: click compose field, paste text, press Return,
          return <code className="text-sm">{"{success: true}"}</code>. That
          works most of the time and fails in subtle ways the rest of the time.
          The compose field can lose focus to an autocorrect popover. The chat
          header can change between paste and Return because a new incoming
          message reordered the sidebar. Catalyst sometimes drops the keystroke
          if the window is in the middle of a layout pass.
        </p>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The only honest verification is to read back the AX tree afterwards
          and look for the message you just sent:
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={verifySendCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          Two design choices worth flagging. First, the comparison is{" "}
          <code className="text-sm">hasPrefix</code> or{" "}
          <code className="text-sm">contains</code>, not equality, because the
          rendered message has been through WhatsApp&apos;s own normalization
          (emoji shortcodes, link previews, trailing whitespace stripped).
          Second, the failed path returns{" "}
          <code className="text-sm">success:true, verified:false</code>, not{" "}
          <code className="text-sm">success:false</code>. If the model sees a
          hard fail it will retry, and a retry is a double-send. A soft
          unverified status lets the agent decide for itself.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          7. Lazy-loaded UI looks empty until you scroll three times
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          WhatsApp&apos;s search results are lazy-loaded. Traverse the AX tree
          right after typing a query and you might see eight results, or two,
          or none, depending on whether the sidebar finished rendering. The
          tempting fix is a longer sleep. The actual fix is to scroll the list
          and re-read, because lazy-load is triggered by user-shaped scroll
          events.
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={scrollLoopCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          Three is empirical. One scroll loads about five more results. Two
          loads ten. After three, the next scroll usually returns nothing new,
          and that&apos;s the signal to stop. The 300ms sleep between scrolls
          gives Catalyst time to finish the cell-creation pass before the next
          scroll fires.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          8. AX descriptions are full of invisible bidirectional Unicode
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Read an{" "}
          <code className="text-sm">AXButton</code>&apos;s description and you
          may get back something that looks like{" "}
          <code className="text-sm">&quot;Sara&quot;</code> on screen but is
          actually{" "}
          <code className="text-sm">&quot;‪Sara‬&quot;</code> in
          bytes. WhatsApp uses bidirectional isolates and embedding marks
          aggressively to keep names, phone numbers, and timestamps rendering
          correctly in RTL locales. Every comparison your MCP does on AX
          strings is wrong if you don&apos;t strip them.
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={unicodeCleanCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The codepoints, in case you ever need to type them into a grep: LRM
          (U+200E), RLM (U+200F), ZWSP (U+200B), ZWNJ (U+200C), ZWJ (U+200D),
          the four isolates U+2066-2069, and the embeddings U+202A-202E. Strip
          them once at the boundary, then every downstream string compare and
          regex behaves.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          9. Quit politely, then force-quit before the MCP client times out
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          <code className="text-sm">NSRunningApplication.terminate()</code> is a
          polite ask. The app can refuse, prompt the user to save, or quietly
          ignore the signal if it&apos;s mid-modal. Meanwhile, the MCP client
          on the other side is waiting for one JSON line and has its own
          tool-call timeout, often 10 to 30 seconds. Block too long and the
          client decides your tool is broken even after the kill goes through.
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={quitCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          Five seconds of grace, then{" "}
          <code className="text-sm">forceTerminate</code>. The response carries
          a <code className="text-sm">force_quit</code> field so the model can
          tell the user why their unsaved draft message disappeared. A silent
          force-quit looks the same to the model as a clean quit, which is
          worse than admitting what happened.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          The checklist version, for the next local stdio MCP
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          If you are about to ship a local MCP that drives a real app, these
          are the failure modes worth pre-mortem-ing.
        </p>

        <div className="mt-6">
          <GlowCard>
            <AnimatedChecklist
              title="Don't do, and do"
              items={checklistItems}
            />
          </GlowCard>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Where this leaves the &quot;MCP server in production&quot; genre
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The HTTP-shaped advice is fine when your MCP server is a thin remote
          wrapper. The moment your server forks under stdio and touches the
          machine, the production surface moves. You stop debugging webhook
          retries and start debugging permission daemons, event taps, and lazy
          AX trees. None of that is in the typical production checklist. All of
          it is in main.swift, with line numbers.
        </p>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The repo is{" "}
          <a
            className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
            href="https://github.com/m13v/whatsapp-mcp-macos"
          >
            github.com/m13v/whatsapp-mcp-macos
          </a>
          . Eleven MCP tools, one Swift file, every gotcha above wired in. If
          you&apos;re building a similar local MCP and want to compare notes on
          your own OS-binding layer, I&apos;m happy to look at it.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 border-t border-zinc-200">
        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Building a local stdio MCP and hitting one of these?"
          description="If you're shipping an MCP that touches the OS and any of this sounds familiar, 25 minutes is usually enough to compare your defense against mine."
        />
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 border-t border-zinc-200">
        <FaqSection heading="FAQ" items={faqItems} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination={CAL_LINK}
        site="WhatsApp MCP"
        description="Shipping a local MCP and hitting one of these? Let's compare notes."
      />
    </article>
  );
}
