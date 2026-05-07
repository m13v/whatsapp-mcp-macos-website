import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  GlowCard,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@seo/components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/whatsapp-desktop-accessibility-automation";
const PUBLISHED = "2026-05-07";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "WhatsApp Desktop accessibility automation: AXIsProcessTrusted is not enough",
  description:
    "Most accessibility automation tutorials check AXIsProcessTrusted and stop. In production that flag returns true while AX child reads silently fail (stale TCC cache). whatsapp-mcp-macos pairs the trust check with a 2.0s functional probe and exposes both states in whatsapp_status.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "WhatsApp Desktop accessibility automation, with the TCC trap caught",
    description:
      "How to drive WhatsApp Desktop on macOS via AXUIElement, why AXIsProcessTrusted lies, and the 60-line probe pattern that detects stale TCC cache before the LLM gets confused.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "WhatsApp Desktop accessibility automation that detects stale TCC cache",
    description:
      "Pair AXIsProcessTrustedWithOptions with a real read of kAXChildrenAttribute under a 2.0s timeout. Surface both states. Source from whatsapp-mcp-macos inside.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "WhatsApp Desktop accessibility automation" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "WhatsApp Desktop accessibility automation", url: PAGE_URL },
];

const trustOnlyCode = `// What most accessibility-automation tutorials show.
// It compiles. It runs. It will lie to you in production.

import ApplicationServices

let trusted = AXIsProcessTrustedWithOptions(
  [kAXTrustedCheckOptionPrompt.takeRetainedValue(): false] as CFDictionary
)

if !trusted {
  print("Grant Accessibility in System Settings, then retry.")
  exit(1)
}

// Now the script assumes every AX call below will work.
// On a fresh TCC cache, fine. On a stale cache, every call
// returns nothing and your agent hallucinates a "no chats found"
// response forever.`;

const probeCode = `// Sources/WhatsAppMCP/main.swift, lines 562 to 608.
// What whatsapp-mcp-macos actually does. Two checks, not one.

func requireAccessibility() -> String? {
  let trusted = AXIsProcessTrustedWithOptions(
    [kAXTrustedCheckOptionPrompt.takeRetainedValue(): false] as CFDictionary
  )
  if trusted { return nil }
  return serializeToJsonString([
    "error": "Accessibility permission not granted...",
    "fix": "Open System Settings > Privacy & Security > Accessibility...",
    "accessibilityTrusted": "false"
  ])
}

// AXIsProcessTrusted can return true while AX calls silently fail
// because of a stale TCC database. So before we trust the flag, we
// actually try to read kAXChildrenAttribute under a 2.0s timeout.
// If the read fails or returns nil, the cache is stale.
func probeAccessibility(pid: pid_t) -> Bool {
  let appElement = AXUIElementCreateApplication(pid)
  AXUIElementSetMessagingTimeout(appElement, 2.0)
  var childrenRef: CFTypeRef?
  let result = AXUIElementCopyAttributeValue(
    appElement, kAXChildrenAttribute as CFString, &childrenRef
  )
  return result == .success && childrenRef != nil
}

// handleStatus surfaces BOTH states so a calling agent can
// distinguish "not granted" from "granted but broken".
func handleStatus() -> String {
  let pid = getWhatsAppPid()
  let trusted = AXIsProcessTrustedWithOptions(
    [kAXTrustedCheckOptionPrompt.takeRetainedValue(): false] as CFDictionary
  )
  var functionallyWorking: Bool? = nil
  if trusted, let pid = pid {
    functionallyWorking = probeAccessibility(pid: pid)
  }
  // ... return whatsappRunning, pid, accessibilityTrusted,
  //     accessibilityWorking, plus a remediation 'warning' field
  //     when trusted=true and working=false.
}`;

const statusSessionLines = [
  { type: "command" as const, text: "# Fresh install. Permission not granted yet." },
  { type: "command" as const, text: "mcp call whatsapp_status" },
  {
    type: "output" as const,
    text:
      '{"whatsappRunning":"true","pid":"82110","accessibilityTrusted":"false","accessibilityWorking":"null"}',
  },
  { type: "info" as const, text: "// Honest. The flag is false; we do not even probe." },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "# After toggling Accessibility on. Cache fresh." },
  { type: "command" as const, text: "mcp call whatsapp_status" },
  {
    type: "output" as const,
    text:
      '{"whatsappRunning":"true","pid":"82110","accessibilityTrusted":"true","accessibilityWorking":"true"}',
  },
  { type: "success" as const, text: "Both flags true. Safe to call any other tool." },
  { type: "command" as const, text: "" },
  {
    type: "command" as const,
    text: "# After a macOS update or after the host app was re-signed.",
  },
  { type: "command" as const, text: "mcp call whatsapp_status" },
  {
    type: "output" as const,
    text:
      '{"whatsappRunning":"true","pid":"82110","accessibilityTrusted":"true","accessibilityWorking":"false",',
  },
  {
    type: "output" as const,
    text:
      '"warning":"Accessibility reports trusted but AX calls are failing. This is common after macOS',
  },
  {
    type: "output" as const,
    text:
      'updates or app re-signing. Try removing and re-adding the app in System Settings > Privacy &',
  },
  { type: "output" as const, text: "Security > Accessibility, then restart the app.\"}" },
  {
    type: "error" as const,
    text:
      "trusted=true, working=false: this is the case the single-check pattern silently misses.",
  },
];

const traverseCode = `// Sources/WhatsAppMCP/main.swift, lines 118 to 176 (abridged).
// The actual function that drives every read tool. Note the
// 5.0s messaging timeout: AX calls go through XPC to the target
// process, and a busy WhatsApp can block long enough to stall
// the MCP child indefinitely without one.

func traverseAXTree(pid: pid_t, maxDepth: Int = 15) -> [AXElementInfo] {
  let appElement = AXUIElementCreateApplication(pid)
  AXUIElementSetMessagingTimeout(appElement, 5.0)
  var results: [AXElementInfo] = []

  func traverse(_ element: AXUIElement, depth: Int) {
    guard depth < maxDepth else { return }

    var roleRef: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &roleRef)
    let role = roleRef as? String ?? ""

    var descRef: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXDescriptionAttribute as CFString, &descRef)
    let desc = descRef as? String

    var valueRef: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXValueAttribute as CFString, &valueRef)

    var titleRef: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXTitleAttribute as CFString, &titleRef)

    var posRef: CFTypeRef?
    var sizeRef: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXPositionAttribute as CFString, &posRef)
    AXUIElementCopyAttributeValue(element, kAXSizeAttribute as CFString, &sizeRef)
    // ... unwrap CGPoint and CGSize from posRef/sizeRef ...

    let hasText =
      (desc?.isEmpty == false) ||
      ((valueRef as? String)?.isEmpty == false) ||
      ((titleRef as? String)?.isEmpty == false)
    let kept: Set<String> = [
      "AXButton","AXTextField","AXTextArea","AXStaticText",
      "AXHeading","AXGenericElement","AXLink"
    ]
    if hasText || kept.contains(role) {
      results.append(/* AXElementInfo with role, text, x, y, w, h */)
    }

    var childrenRef: CFTypeRef?
    AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &childrenRef)
    guard let children = childrenRef as? [AXUIElement] else { return }
    for child in children { traverse(child, depth: depth + 1) }
  }

  traverse(appElement, depth: 0)
  return results
}`;

const clickAndPasteCode = `// Sources/WhatsAppMCP/main.swift, lines 195 to 237.
// Once you have x, y, w, h from the AX tree, the actual click
// is a CGEvent post. The cursor save/restore is what makes the
// automation invisible to a user who is also at the keyboard.

func saveCursorPosition() -> CGPoint? {
  let nsPos = NSEvent.mouseLocation
  guard let primary = NSScreen.screens.first else { return nil }
  // NSEvent uses bottom-origin; CGEvent uses top-origin. Flip Y.
  return CGPoint(x: nsPos.x, y: primary.frame.height - nsPos.y)
}

func clickAt(x: Double, y: Double) {
  let saved = saveCursorPosition()
  let point = CGPoint(x: x, y: y)
  let src = CGEventSource(stateID: .hidSystemState)
  CGEvent(mouseEventSource: src, mouseType: .leftMouseDown,
          mouseCursorPosition: point, mouseButton: .left)?.post(tap: .cghidEventTap)
  CGEvent(mouseEventSource: src, mouseType: .leftMouseUp,
          mouseCursorPosition: point, mouseButton: .left)?.post(tap: .cghidEventTap)
  if let saved = saved { restoreCursorPosition(saved) }
}

// Why paste, not type: typing every character via CGEvent is
// 30 to 200ms per character, fails on emoji and many non-ASCII
// inputs, and races with WhatsApp's IME. Paste is one keystroke.
// Backup the user's clipboard before, restore after.
func pasteText(_ text: String) -> Bool {
  let pb = NSPasteboard.general
  let backup = pb.string(forType: .string)
  pb.clearContents()
  guard pb.setString(text, forType: .string) else { return false }
  sendKeyEvent(keyCode: 9, flags: .maskCommand) // Cmd+V
  Thread.sleep(forTimeInterval: 0.35)
  pb.clearContents()
  if let backup = backup { _ = pb.setString(backup, forType: .string) }
  return true
}`;

const stepData = [
  {
    title: "1. Resolve the WhatsApp PID by bundle id, not by window title",
    description:
      "Window titles change with the active chat. Bundle ids do not. whatsapp-mcp-macos hardcodes net.whatsapp.WhatsApp and looks up the PID via NSRunningApplication. If the app is not running, launch it with /usr/bin/open -a WhatsApp.app and wait two seconds for the AX tree to settle.",
    detail: (
      <pre className="text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-md p-3 overflow-x-auto">
{`let bundleID = "net.whatsapp.WhatsApp"
let apps = NSRunningApplication
  .runningApplications(withBundleIdentifier: bundleID)
let pid = apps.first?.processIdentifier`}
      </pre>
    ),
  },
  {
    title: "2. Verify accessibility with TWO checks, not one",
    description:
      "Call AXIsProcessTrustedWithOptions with the prompt suppressed. Then attach to the WhatsApp PID, set a 2.0 second AX messaging timeout, and try to read kAXChildrenAttribute on the root element. Only treat the host as functionally working when the read succeeds AND returns a non-nil children ref. This is the part of the pattern that catches a stale TCC cache.",
  },
  {
    title: "3. Attach to the target with AXUIElementCreateApplication and a 5.0s timeout",
    description:
      "AXUIElementCreateApplication(pid) returns the root AX element for the target process. AX calls go through XPC; without a messaging timeout, a busy or hung target hangs the caller indefinitely. whatsapp-mcp-macos uses 2.0s for the probe (where you want to fail fast) and 5.0s for the real traversal (where the app might briefly stutter while a chat loads).",
  },
  {
    title: "4. Recurse through kAXChildrenAttribute with a depth cap of 15",
    description:
      "Catalyst apps have absurdly deep AX hierarchies. A maxDepth of 15 catches the leaves of the WhatsApp chat list and message panel without blowing the stack on a runaway tree. On every node read kAXRoleAttribute, kAXDescriptionAttribute, kAXValueAttribute, kAXTitleAttribute, kAXPositionAttribute, kAXSizeAttribute. Keep nodes with non-empty text or with a role in the meaningful set: AXButton, AXTextField, AXTextArea, AXStaticText, AXHeading, AXGenericElement, AXLink.",
  },
  {
    title: "5. Find target elements by role plus a substring of description, value, or title",
    description:
      "WhatsApp Desktop's AX tree exposes contact names and message text in kAXDescriptionAttribute, search input in an AXTextField, and the compose box as an AXTextArea whose description usually contains 'compose', 'message', or 'type'. Lowercase both sides of the comparison. Take element coordinates as absolute screen pixels.",
  },
  {
    title: "6. Click by posting a CGEvent at the element center, then restore the cursor",
    description:
      "Compute (x + width/2, y + height/2) and post a leftMouseDown/leftMouseUp pair via CGEventSource(stateID: .hidSystemState).post(tap: .cghidEventTap). Save NSEvent.mouseLocation before, flip Y from NSEvent's bottom-origin to CGEvent's top-origin, and restore the cursor at the end. The user does not see their cursor jump.",
  },
  {
    title: "7. Type via Cmd+V paste, not character-by-character CGEvent typing",
    description:
      "Per-character CGEvent typing fails on emoji, fights with WhatsApp's IME, and is slow enough to race the message render. Backup the user's clipboard, set the new value, post Cmd+V, sleep 350 ms, restore the original clipboard. One keystroke, full unicode, predictable.",
  },
  {
    title: "8. Re-read the AX tree after the action and verify the change",
    description:
      "After hitting Return, traverse the tree again and look for an AXGenericElement whose description starts with 'Your message, '. That is how WhatsApp Catalyst announces an outgoing bubble to VoiceOver. If you see it, return verified: true. If not, return verified: false plus a snippet of whatever did appear, so the calling agent can self-correct instead of pretending success.",
  },
];

const comparisonRows = [
  {
    feature: "What gets driven",
    competitor:
      "A Chromium tab pointed at web.whatsapp.com. The DOM, the IndexedDB session, and the ServiceWorker are the surface area you act against.",
    ours:
      "The native net.whatsapp.WhatsApp Catalyst process. The macOS accessibility tree of that process is the surface area; the underlying app is unaware anything beyond a real user is interacting.",
  },
  {
    feature: "How elements are addressed",
    competitor:
      "CSS selectors against a heavily-obfuscated DOM that rotates class names on every Meta build (e.g. _akbu, _akbv). Selectors break weekly.",
    ours:
      "kAXRoleAttribute filtered to AXButton/AXTextField/AXTextArea/AXStaticText/AXGenericElement/AXLink, then a substring match on kAXDescriptionAttribute, kAXValueAttribute, or kAXTitleAttribute. AX descriptions track VoiceOver labels, which Meta has not been observed to obfuscate.",
  },
  {
    feature: "Pairing model",
    competitor:
      "QR code each session in a clean profile, plus the multi-device Signal Protocol fork (whatsmeow et al.) if you want to bypass the browser. Both are fragile under Meta's anti-automation heuristics.",
    ours:
      "Whatever pairing the human already did inside the WhatsApp Desktop app. The MCP server never touches the network protocol; if the desktop app is logged in, you are logged in.",
  },
  {
    feature: "Permission surface",
    competitor:
      "None at the OS level, but Meta-side: account flags, rate-limits, and the risk of being banned for scripted browser activity at scale.",
    ours:
      "macOS Accessibility, granted to the host process that forks the MCP child (e.g. Claude.app, Cursor.app, Terminal). One toggle, one user consent. No Meta-side keys.",
  },
  {
    feature: "Failure mode that costs the most time",
    competitor:
      "A class name rotates and every selector in the codebase 404s at once. You ship a patch within hours or the bot is dark.",
    ours:
      "Stale TCC cache after a macOS update or a host app re-sign. AXIsProcessTrusted reports true, AX child reads return nothing. Without a functional probe in your status output, the LLM gets confused for hours; with the probe, the user is told to remove and re-add the host app in Privacy & Security in one breath.",
  },
  {
    feature: "Cross-app reuse",
    competitor:
      "The whole driver is bound to web.whatsapp.com. Driving Slack or Linear is a fresh project.",
    ours:
      "The exact same Swift loop that drives net.whatsapp.WhatsApp can target /System/Applications/Calculator.app or any Catalyst window the user has Accessibility access for. The walker, the click, and the probe pattern are app-agnostic.",
  },
  {
    feature: "What runs where",
    competitor:
      "A headless Chromium plus a session store, plus a process supervisor. Resident memory in the hundreds of megabytes.",
    ours:
      "A single Swift binary started by the MCP client over stdio. Roughly twenty megabytes resident; nothing runs when no tool is invoked.",
  },
];

const faqItems = [
  {
    q: "Why is AXIsProcessTrusted not enough on its own?",
    a: "AXIsProcessTrustedWithOptions reads a flag in the per-process trust cache. After a macOS update, an app re-sign, a code-signing identity rotation, or simply a TCC database getting out of sync with the on-disk app bundle, that flag can return true while every AXUIElementCopyAttributeValue call against a target PID returns errors or nil. The host process thinks it has accessibility; the kernel disagrees. The fix is to actually exercise the API once at startup with a tight timeout, and surface both states so a caller can distinguish 'not granted' from 'granted but broken'.",
  },
  {
    q: "What is the smallest end-to-end loop to drive WhatsApp Desktop from a Swift script?",
    a: "Look up the PID with NSRunningApplication.runningApplications(withBundleIdentifier: 'net.whatsapp.WhatsApp'). Call AXUIElementCreateApplication(pid) and AXUIElementSetMessagingTimeout(root, 5.0). Recurse through kAXChildrenAttribute up to depth 15, capturing role, description, value, title, position, and size on each node. Filter to AXButton, AXTextField, AXTextArea, AXStaticText, AXGenericElement, AXLink, plus anything with non-empty text. Find the compose AXTextArea by description substring, click its center via CGEvent, paste with Cmd+V, post a Return key event. About 250 lines of Swift.",
  },
  {
    q: "Why use clipboard paste instead of typing characters one at a time?",
    a: "Posting a CGEvent for each character takes 30 to 200 ms per character, depending on the source rate and how the target's IME schedules input. Emoji, ZWJ sequences, RTL marks, and many non-ASCII characters either fail or arrive out of order. Pasting via Cmd+V is a single keystroke regardless of payload size, handles all unicode, and lands as one atomic edit in the WhatsApp compose field. The only cost is briefly clobbering the user's clipboard, which is mitigated by saving the prior value, sleeping 350 ms, and restoring it.",
  },
  {
    q: "How does the automation know it is talking to the right chat?",
    a: "The send tool refuses to fire unless getActiveChatName(pid:) returns a non-empty string by walking the AX tree of the chat panel. After the send, the tool walks the tree again and looks for an AXGenericElement whose description starts with 'Your message, '. That string is what the WhatsApp Catalyst app announces to VoiceOver when an outgoing bubble is rendered. If it is present and contains a prefix match against what was sent, the tool returns verified: true; otherwise it returns verified: false with a snippet of what did appear, so the calling LLM can correct.",
  },
  {
    q: "What does the AX messaging timeout actually protect against?",
    a: "AXUIElementCopyAttributeValue is a synchronous IPC call into the target process via XPC. If the target is busy, hung, beachballing, or in a state where the AX server is blocked behind a layout pass, the call can wait indefinitely. AXUIElementSetMessagingTimeout caps that wait. whatsapp-mcp-macos uses 2.0 seconds for the boot-time probe (you want fast failure if the cache is stale) and 5.0 seconds for the real traversal during a tool call (long enough that a brief stutter while a chat loads does not abort).",
  },
  {
    q: "What if accessibilityTrusted is true but accessibilityWorking is false?",
    a: "That is the stale TCC cache case the probe is designed to catch. The remediation that ships in the status JSON is: open System Settings > Privacy & Security > Accessibility, find the host app that runs the MCP server (Claude.app, Cursor.app, Fazm, or Terminal, depending on how you launched it), toggle it off, click the minus button to remove it entirely, then add it back with the plus button and toggle on. Quit and relaunch the host app afterward. That sequence rebuilds the TCC entry from the current code-signing identity.",
  },
  {
    q: "Does this approach work for WhatsApp on Windows or Linux?",
    a: "No. The whole approach is built on AXUIElement, which is an Apple-platform-only framework (ApplicationServices on macOS, UIAccessibility on iOS but not exposed for cross-app driving). Windows has UI Automation (UIA) with a similar shape but a totally different API; on Linux there is AT-SPI but no native WhatsApp app to drive. whatsapp-mcp-macos is macOS only, by design and by the realities of the underlying frameworks.",
  },
  {
    q: "Will Meta detect or block this?",
    a: "There is no network-level signal for an automation built this way. The MCP server never touches WhatsApp's servers; it touches the running app the user already has logged in. The clicks, paste, and Return key are indistinguishable to the app from a human at the keyboard, because at the OS level they are CGEvents posted into the same HID event tap a real user's input goes through. Risk surface is OS permissions and the user's own behavior, not Meta-side anti-automation.",
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
                "WhatsApp Desktop accessibility automation: AXIsProcessTrusted is not enough",
              description:
                "How whatsapp-mcp-macos drives the native WhatsApp Catalyst app via AXUIElement, and why every accessibility-automation guide that stops at AXIsProcessTrusted will silently fail in production.",
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

      <header className="max-w-4xl mx-auto px-6 pt-8 pb-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
          WhatsApp Desktop accessibility automation, the part most guides skip
        </h1>
        <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
          The minimal recipe for driving WhatsApp Desktop on macOS via the
          accessibility APIs is small: attach to the PID with{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            AXUIElementCreateApplication
          </code>
          , recurse{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            kAXChildrenAttribute
          </code>
          , post{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            CGEvent
          </code>{" "}
          mouse and keyboard events at the resolved coordinates. Every blog
          post and every example repo gets that part right. The part they get
          wrong is permission verification: they call{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            AXIsProcessTrustedWithOptions
          </code>{" "}
          and stop. In production that flag returns{" "}
          <code className="text-sm bg-zinc-100 px-1.5 py-0.5 rounded">true</code>{" "}
          while every AX call silently fails, and the calling agent has no idea
          why.
        </p>
        <div className="mt-6">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="9 min read"
          />
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 my-8">
        <GlowCard>
          <div className="p-6">
            <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold mb-3">
              Direct answer (verified 2026-05-07)
            </p>
            <p className="text-zinc-800 leading-relaxed">
              To automate WhatsApp Desktop with macOS accessibility, run a
              native binary that calls{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                AXUIElementCreateApplication(pid)
              </code>{" "}
              against the WhatsApp PID, sets a messaging timeout via{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                AXUIElementSetMessagingTimeout
              </code>
              , recurses through{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                kAXChildrenAttribute
              </code>{" "}
              to build a flat list of{" "}
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
              , and{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                AXStaticText
              </code>{" "}
              nodes with their absolute screen coordinates, then posts{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                CGEvent
              </code>{" "}
              mouse and keyboard events at those coordinates. The host process
              must be enabled in System Settings &gt; Privacy &amp; Security &gt;
              Accessibility, AND the TCC cache for that host must be fresh.
              Verify the second condition with a functional probe (a real read
              of <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">kAXChildrenAttribute</code>{" "}
              under a 2.0 second timeout), not just{" "}
              <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
                AXIsProcessTrustedWithOptions
              </code>
              . The framework reference is at{" "}
              <a
                href="https://developer.apple.com/documentation/applicationservices/axuielement_h"
                className="text-teal-700 hover:text-teal-800 underline"
                rel="noopener"
              >
                developer.apple.com/documentation/applicationservices/axuielement_h
              </a>
              .
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The pattern every other guide ships
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          If you read three or four accessibility-automation guides aimed at
          driving a Catalyst or AppKit app on macOS, the permission-check
          section is always the same. Some variant of this:
        </p>
        <AnimatedCodeBlock
          code={trustOnlyCode}
          language="swift"
          filename="naive-permission-check.swift"
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          That code compiles, runs, and looks correct. It will pass any unit
          test you can think to write. It will work flawlessly on a fresh
          macOS install, on a freshly granted Accessibility permission, the
          first time anyone runs the script. It is also wrong, and the way it
          is wrong is the worst kind: a silent false positive whose only
          symptom is that downstream tools return empty results and your
          agent loops on a hallucinated diagnosis.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why the trust flag lies
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          macOS keeps a per-process trust cache called TCC (Transparency,
          Consent, and Control). When you toggle an app on in Privacy &amp;
          Security &gt; Accessibility, the TCC database records a row keyed
          to the app&apos;s code-signing identity and bundle id. When a
          process calls{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            AXIsProcessTrustedWithOptions
          </code>
          , macOS reads that row and returns true if it matches.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The catch: the row is bound to the code-signing identity that was
          present when you first granted permission. If anything changes the
          on-disk binary&apos;s signature without TCC invalidating the
          cache, the lookup still hits the old row and reports true. But the
          live AX subsystem now sees a different signature on the calling
          process and rejects every actual{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            AXUIElementCopyAttributeValue
          </code>{" "}
          call. From the script&apos;s perspective, you are trusted; from
          the kernel&apos;s perspective, you are not. The two never agree.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The triggers are mundane. A macOS minor update that bumps a
          system-level signature. A homebrew reinstall of a host app that
          re-signs the bundle. An over-the-top app update that ships a new
          provisioning profile. A switch between code signing identities
          during development. None of these are exotic. All of them produce
          the same surface symptom: status checks pass, every other tool
          returns nothing.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The only honest way to detect the broken state is to actually try
          to use the API. Read{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            kAXChildrenAttribute
          </code>{" "}
          on the root element. If it returns nil or an error,{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            AXIsProcessTrusted
          </code>{" "}
          is lying to you and you have a remediation message to surface.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The pattern whatsapp-mcp-macos uses instead
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Two functions, lifted from{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            Sources/WhatsAppMCP/main.swift
          </code>
          . Note the two distinct timeouts: 2.0 seconds for the probe so a
          stale cache fails fast, and 5.0 seconds for the real traversal
          (further down) so a brief layout pass in WhatsApp does not abort a
          tool call.
        </p>
        <AnimatedCodeBlock
          code={probeCode}
          language="swift"
          filename="Sources/WhatsAppMCP/main.swift"
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          The exposed shape of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            whatsapp_status
          </code>{" "}
          is what a calling LLM agent reads, and the difference between the
          three states is what tells the agent (or the human running it)
          exactly what to do next. Three real responses, copied from the
          binary at three different machine states:
        </p>
        <div className="mt-6">
          <TerminalOutput lines={statusSessionLines} title="whatsapp_status, three machine states" />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Walking the AX tree once you trust it
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Once both flags are true, every other tool call ends up here:{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            traverseAXTree(pid:)
          </code>
          . It returns a flat list of{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            AXElementInfo
          </code>{" "}
          values, each carrying enough role and screen-coordinate data for
          the click and read tools to operate on. The depth cap of 15 is
          empirical: any deeper and you hit pure skeleton-container leaves
          inside Catalyst&apos;s rendering pipeline; any shallower and you
          miss the chat list rows.
        </p>
        <AnimatedCodeBlock
          code={traverseCode}
          language="swift"
          filename="Sources/WhatsAppMCP/main.swift"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Clicks and paste, two surprisingly load-bearing details
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The AX tree gives you positions. Clicking and typing happens
          outside AX, through the HID event tap. Two things are easy to get
          wrong here. The first is the cursor: if you do not save and
          restore the user&apos;s mouse position around every click, the
          cursor jumps around the screen while the agent is working, which
          users hate immediately. The second is text input: per-character
          CGEvent typing is slow, races with the IME, and corrupts emoji.
          Paste does not.
        </p>
        <AnimatedCodeBlock
          code={clickAndPasteCode}
          language="swift"
          filename="Sources/WhatsAppMCP/main.swift"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <StepTimeline
          title="The full loop, end to end"
          steps={stepData}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Accessibility automation vs. WhatsApp Web automation
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The other widespread approach to automating WhatsApp without the
          Business API is driving{" "}
          <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            web.whatsapp.com
          </code>{" "}
          in headless Chromium. It works, but it has a different shape of
          fragility. Honest tradeoffs, in the dimensions that actually
          decide which one breaks first in production:
        </p>
        <ComparisonTable
          productName="whatsapp-mcp-macos (accessibility)"
          competitorName="web.whatsapp.com automation (browser)"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Building an agent that actually has to read your WhatsApp?"
          description="If you are wiring a Claude or Cursor workflow to WhatsApp Desktop and you want the TCC trap caught, the AX tree walked, and the send verified before you tell a user it shipped, walk through it with us."
        />
      </section>

      <FaqSection items={faqItems} />

      <BookCallCTA
        appearance="sticky"
        destination={CAL_LINK}
        site="WhatsApp MCP"
        description="Got an AX tree question or a stale-TCC bug you cannot reproduce? Book a 30 minute pairing slot."
      />
    </article>
  );
}
