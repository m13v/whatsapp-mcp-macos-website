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
} from "@m13v/seo-components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/intellij-mcp-accessibility-tree";
const PUBLISHED = "2026-05-07";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "IntelliJ MCP and the macOS accessibility tree: same word, different graph",
  description:
    "IntelliJ's built-in MCP server (IntelliJ 2025.2+) does not expose the macOS accessibility tree. It exposes IDE tools like list_directory_tree and get_symbol_info. To walk a real macOS AX tree from an MCP server you need a native binary that calls AXUIElementCreateApplication on the target PID. Worked example with Swift source from whatsapp-mcp-macos.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title:
      "IntelliJ MCP and the macOS accessibility tree are different graphs",
    description:
      "Two different things share the word 'tree' here. IntelliJ MCP walks the project tree and PSI symbols. The macOS accessibility tree is an OS-level UI graph for any running app. Here is what each one actually exposes, with code.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "IntelliJ MCP vs the macOS accessibility tree",
    description:
      "IntelliJ's MCP exposes list_directory_tree and get_symbol_info. macOS AX trees need AXUIElementCreateApplication. They do not compose. Worked example inside.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "IntelliJ MCP and the macOS accessibility tree" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  { name: "Guides", url: "https://whatsapp-mcp-macos.com/t" },
  { name: "IntelliJ MCP and the macOS accessibility tree", url: PAGE_URL },
];

const intellijMcpToolsCode = `// What IntelliJ's built-in MCP server actually exposes.
// Source: https://www.jetbrains.com/help/idea/mcp-server.html
//         https://youtrack.jetbrains.com/articles/SUPPORT-A-2156

// File and project navigation
list_directory_tree         // walks the IDE's project view tree
find_files_by_glob
find_files_by_name_keyword
get_file_text_by_path
search_in_files_by_text
search_in_files_by_regex
open_file_in_editor

// Code analysis
get_file_problems           // errors and warnings from the inspector
get_symbol_info             // symbol declaration at a position

// Project introspection
get_run_configurations
get_project_modules
get_project_dependencies

// Modification
create_new_file
replace_text_in_file
reformat_file
rename_refactoring          // PSI-aware rename

// Execution and database
execute_terminal_command
execute_run_configuration
// plus a database / SQL group

// Notice what is NOT in this list:
// no AXUIElement, no kAXChildrenAttribute, no Accessibility prompt,
// no PID targeting, no read of any window outside the IDE.`;

const axTreeCode = `// Sources/WhatsAppMCP/main.swift, lines 95 to 176.
// This is the function that does the work the keyword is asking about.

struct AXElementInfo {
    let role: String
    let description: String?
    let value: String?
    let title: String?
    let x: Double
    let y: Double
    let width: Double
    let height: Double
}

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
        let value = valueRef as? String

        var titleRef: CFTypeRef?
        AXUIElementCopyAttributeValue(element, kAXTitleAttribute as CFString, &titleRef)
        let title = titleRef as? String

        var posRef: CFTypeRef?
        var sizeRef: CFTypeRef?
        AXUIElementCopyAttributeValue(element, kAXPositionAttribute as CFString, &posRef)
        AXUIElementCopyAttributeValue(element, kAXSizeAttribute as CFString, &sizeRef)

        // ... record element if it has text or matches a meaningful role ...

        var childrenRef: CFTypeRef?
        AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &childrenRef)
        guard let children = childrenRef as? [AXUIElement] else { return }
        for child in children {
            traverse(child, depth: depth + 1)
        }
    }

    traverse(appElement, depth: 0)
    return results
}`;

const accessibilityCheckCode = `// Sources/WhatsAppMCP/main.swift, lines 561 to 610.
// The trust check + functional probe. Both are needed because
// AXIsProcessTrustedWithOptions can return true while the TCC
// cache is stale and accessibility calls silently fail.

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

// Functional probe: actually try to read the AX tree.
func probeAccessibility(pid: pid_t) -> Bool {
    let appElement = AXUIElementCreateApplication(pid)
    AXUIElementSetMessagingTimeout(appElement, 2.0)
    var childrenRef: CFTypeRef?
    let result = AXUIElementCopyAttributeValue(
        appElement, kAXChildrenAttribute as CFString, &childrenRef
    )
    return result == .success
}`;

const probeLines = [
  { type: "command" as const, text: "# IntelliJ MCP, asking it to walk the project view tree" },
  { type: "command" as const, text: 'mcp call list_directory_tree --path "src/main/java"' },
  { type: "output" as const, text: "[directories...]  [files...]  // virtual file system, all JVM" },
  { type: "info" as const, text: "// nothing here ever crosses into AppKit or AXUIElement" },
  { type: "command" as const, text: "" },
  { type: "command" as const, text: "# WhatsApp MCP, asking it to walk the macOS AX tree of the running app" },
  { type: "command" as const, text: "mcp call whatsapp_search --query \"alice\"" },
  { type: "output" as const, text: "AXUIElementCreateApplication(pid: 12345)" },
  { type: "output" as const, text: "AXUIElementSetMessagingTimeout(5.0)" },
  { type: "output" as const, text: "kAXChildrenAttribute -> [12 nodes]" },
  { type: "output" as const, text: "kAXRoleAttribute -> AXButton, AXTextField, AXStaticText..." },
  { type: "success" as const, text: "5 search result buttons under x>1750 chat panel" },
];

const comparisonRows = [
  {
    feature: "What 'tree' actually means",
    competitor:
      "The IDE's project view: directories, files, and PSI symbols. A JVM-side data structure rendered into the Project tool window.",
    ours:
      "The macOS accessibility tree of a running native or Catalyst app. A C-level graph of AXUIElement nodes the OS exposes for VoiceOver, Switch Control, and any AX-aware client.",
  },
  {
    feature: "Where the tree lives",
    competitor:
      "Inside the IntelliJ JVM. Lifecycle is bound to the IDE process and its open project. No tree exists when no project is open.",
    ours:
      "Inside the target app's process address space, exposed via the OS accessibility framework. Lives as long as the app is running, regardless of which IDE the developer is in.",
  },
  {
    feature: "How the MCP server reaches it",
    competitor:
      "The MCP server is a JetBrains plugin running in-process inside IntelliJ. It calls IntelliJ APIs (VirtualFile, PsiManager, ProjectRootManager). No IPC to the OS.",
    ours:
      "The MCP server is a separate native binary. It calls AXUIElementCreateApplication(pid) to attach by PID, then recurses through kAXChildrenAttribute. IPC is through XPC under the hood.",
  },
  {
    feature: "What permission the user grants",
    competitor:
      "None beyond installing the MCP Server plugin and trusting it inside the IDE.",
    ours:
      "macOS Accessibility, granted to the host process that forks the MCP child (Claude.app, Cursor.app, Terminal). Without that toggle, every AX call returns nothing.",
  },
  {
    feature: "Cross-app reach",
    competitor:
      "None. The IDE-level MCP cannot read Slack, WhatsApp, Safari, or even another IDE window. It is bound to the JVM project context.",
    ours:
      "Any running app the user has Accessibility permission for. The same Swift code that walks WhatsApp's AX tree can target /System/Applications/Calculator.app or Linear's Catalyst window.",
  },
  {
    feature: "Tree node attributes",
    competitor:
      "PSI fields: file path, line, symbol name, type, references. The 'tree' is a code structure, not a UI structure.",
    ours:
      "kAXRoleAttribute, kAXDescriptionAttribute, kAXValueAttribute, kAXTitleAttribute, kAXPositionAttribute, kAXSizeAttribute, kAXChildrenAttribute. A UI structure with absolute screen coordinates.",
  },
  {
    feature: "Failure modes",
    competitor:
      "IDE not open, project not indexed, plugin disabled, file outside project scope.",
    ours:
      "Permission denied, TCC cache stale, target app not running, AX tree slow to settle, app uses a non-AX rendering path (an Electron app with a webview, for example).",
  },
];

const stepData = [
  {
    title: "1. Identify the target by bundle id, not by window title",
    description:
      "Use NSRunningApplication to look up the PID for the bundle id. Window titles change; bundle ids do not. WhatsApp MCP hardcodes net.whatsapp.WhatsApp.",
    detail: (
      <pre className="text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-md p-3 overflow-x-auto">
{`let bundleId = "net.whatsapp.WhatsApp"
let apps = NSRunningApplication
  .runningApplications(withBundleIdentifier: bundleId)
let pid = apps.first?.processIdentifier`}
      </pre>
    ),
  },
  {
    title: "2. Attach with AXUIElementCreateApplication and set a messaging timeout",
    description:
      "AXUIElementCreateApplication(pid) returns the root element. Always set a messaging timeout: AX calls go through XPC and a hung target will hang the MCP child indefinitely. WhatsApp MCP uses 5.0 seconds.",
  },
  {
    title: "3. Recurse through kAXChildrenAttribute with a depth cap",
    description:
      "Many Catalyst apps have absurdly deep accessibility hierarchies. A maxDepth of around 15 is what works for WhatsApp Desktop without missing leaf elements. Read role, description, value, title, position, and size on each node and keep what is meaningful.",
  },
  {
    title: "4. Filter by role and text on the way back up",
    description:
      "Most nodes are skeleton containers. Keep AXButton, AXTextField, AXTextArea, AXStaticText, AXHeading, AXGenericElement, AXLink, plus anything with non-empty description, value, or title. That filter cuts the tree from thousands of nodes to dozens or hundreds.",
  },
  {
    title: "5. Verify the permission with both a flag check and a functional probe",
    description:
      "AXIsProcessTrustedWithOptions can return true while AX calls silently fail because of a stale TCC database. Always do a real read of kAXChildrenAttribute on the root element as a probe and surface a remediation message that points at System Settings > Privacy & Security > Accessibility.",
  },
];

const faqItems = [
  {
    q: "Does IntelliJ's MCP server expose the macOS accessibility tree?",
    a: "No. IntelliJ's built-in MCP server, shipped from IntelliJ 2025.2 onward and documented at https://www.jetbrains.com/help/idea/mcp-server.html, exposes IDE-level tools only: list_directory_tree, find_files_by_glob, find_files_by_name_keyword, get_file_text_by_path, search_in_files_by_text, search_in_files_by_regex, get_file_problems, get_symbol_info, get_run_configurations, get_project_modules, get_project_dependencies, create_new_file, replace_text_in_file, reformat_file, rename_refactoring, plus terminal and database tools. None of those reach into the macOS accessibility framework. There is no AXUIElement call, no PID targeting, no Accessibility permission prompt. The IntelliJ MCP cannot read another app's UI, and it cannot even read the IDE's own UI through accessibility, because it talks to IntelliJ's PSI and VirtualFile APIs in the JVM, not to the OS.",
  },
  {
    q: "Then why does this keyword put 'IntelliJ MCP' and 'accessibility tree' next to each other?",
    a: "Because both ideas use the word 'tree' and both have an MCP server, so people conflate them. JetBrains marketing talks about IntelliJ's MCP letting agents 'walk the project tree' and read 'symbol declarations'. Independent tutorials about MCP servers for desktop control talk about 'walking the macOS accessibility tree' to drive apps. Two different graphs. Two different MCP servers. They do not compose. If you want the IntelliJ MCP to be able to click around inside the IntelliJ window, that is not how it works; you would need a separate AX-walking MCP that targets the IntelliJ PID via its bundle id (com.jetbrains.intellij or com.jetbrains.intellij.ce).",
  },
  {
    q: "What does an MCP server that actually walks the macOS accessibility tree look like?",
    a: "It looks like Sources/WhatsAppMCP/main.swift in the whatsapp-mcp-macos repo. Lines 95 to 176 define traverseAXTree(pid:, maxDepth: 15). The function calls AXUIElementCreateApplication(pid), sets AXUIElementSetMessagingTimeout(appElement, 5.0), then recursively reads kAXRoleAttribute, kAXDescriptionAttribute, kAXValueAttribute, kAXTitleAttribute, kAXPositionAttribute, kAXSizeAttribute, kAXChildrenAttribute. The recursion has a depth cap because Catalyst apps tend to have very deep hierarchies. A role filter at the leaves keeps AXButton, AXTextField, AXTextArea, AXStaticText, AXHeading, AXGenericElement, AXLink, plus anything with text. Source is at https://github.com/m13v/whatsapp-mcp-macos.",
  },
  {
    q: "Why do I need a separate native binary instead of a JVM plugin?",
    a: "AXUIElement is a C API in the macOS ApplicationServices framework. Reaching it from a JVM means JNI, which IntelliJ's MCP plugin does not bother with because that is not what it is for. A native Swift or Objective-C binary running outside the JVM hits the API directly, and it can be invoked over stdio by any MCP host: Claude Code, Cursor, Windsurf, Codex, an LLM-powered shell. The MCP host forks the binary, pipes JSON-RPC over stdin and stdout, and the binary talks to the OS accessibility framework on behalf of whichever LLM is connected.",
  },
  {
    q: "What exact attribute keys do I need to read off each AXUIElement node?",
    a: "For a UI tree useful to an LLM agent, seven keys are enough: kAXRoleAttribute (so you can filter to interactable element types), kAXDescriptionAttribute (the human-readable label that VoiceOver would speak), kAXValueAttribute (current text in a field), kAXTitleAttribute (window or button title), kAXPositionAttribute and kAXSizeAttribute (so the agent can click at the center of an element with CGEvent), and kAXChildrenAttribute (to recurse). WhatsApp MCP reads exactly those seven, drops nodes with no text content unless the role is one of AXButton, AXTextField, AXTextArea, AXStaticText, AXHeading, AXGenericElement, or AXLink, and returns a flat array. Flat is easier for an LLM to reason about than a nested tree.",
  },
  {
    q: "Why a 5.0 second messaging timeout?",
    a: "AXUIElement calls go through XPC, which is asynchronous IPC under the hood. If the target app is hung, paused under a debugger, or refusing to respond on its main thread, an AX call will block forever. AXUIElementSetMessagingTimeout(element, 5.0) caps that wait at five seconds and turns a hang into a clean error code your MCP server can return as JSON. WhatsApp MCP uses 5.0 seconds for normal calls and 2.0 seconds for the boot-time functional probe at line 576. Without this, a hung WhatsApp window would freeze the MCP child until the host process restarted it.",
  },
  {
    q: "Why is AXIsProcessTrustedWithOptions returning true not enough?",
    a: "macOS's TCC database (Transparency, Consent, and Control) caches Accessibility grants per code-signed identity. After macOS updates, app re-signing, or moving an app between /Applications and ~/Applications, that cache can go stale. The flag is true because the user once granted permission to a binary with this bundle id, but the actual AX calls fail because the OS cannot match the running binary to the cached grant. The fix is to remove and re-add the host app in System Settings > Privacy & Security > Accessibility, then restart. Detect this by also doing a functional probe: read kAXChildrenAttribute on the root element and check whether the call actually succeeds. WhatsApp MCP does both at lines 561 to 610 of main.swift.",
  },
  {
    q: "Can I point IntelliJ's MCP and an AX-walking MCP at the same agent at the same time?",
    a: "Yes, and that is the most useful pattern. MCP hosts like Claude Code accept multiple MCP servers in one config. Add IntelliJ's MCP server for code-level work (refactor, search, run configurations) and add an accessibility-tree MCP for OS-level work (read a chat in WhatsApp Desktop, click a button in Finder, drag a file out of the IDE into another app). They occupy completely different tool namespaces. The agent picks tools per request. WhatsApp MCP exposes whatsapp_status, whatsapp_start, whatsapp_quit, whatsapp_get_active_chat, whatsapp_list_chats, whatsapp_search, whatsapp_open_chat, whatsapp_scroll_search, whatsapp_read_messages, whatsapp_send_message, and whatsapp_navigate, none of which collide with anything IntelliJ ships.",
  },
  {
    q: "What about Electron apps and accessibility trees?",
    a: "This is the honest limitation. Pure Electron apps, Slack and Discord being the canonical examples, render their UI in a Chromium webview. The macOS accessibility framework can see the outer window chrome and a single AXWebArea node, but the actual UI nodes inside are DOM elements behind that webview. You can sometimes coax Chromium into exposing a fuller AX tree by setting --force-renderer-accessibility, but it is unreliable and slow. Catalyst apps like WhatsApp and Apple's own native apps expose a full AX tree and are the right targets for this pattern. If you need to drive an Electron app from an MCP, browser-style automation (CDP, Playwright) is usually the better fit.",
  },
  {
    q: "Where do I read this code for myself?",
    a: "https://github.com/m13v/whatsapp-mcp-macos. The accessibility-walking code is in Sources/WhatsAppMCP/main.swift. Specific line ranges referenced on this page: 95 to 176 (struct AXElementInfo and traverseAXTree), 561 to 610 (requireAccessibility and probeAccessibility), 57 (the bundle id constant). The package is also on npm as whatsapp-mcp-macos with a postinstall step that runs xcrun swift build -c release to compile the binary on install.",
  },
];

const jsonLd = [
  articleSchema({
    headline:
      "IntelliJ MCP and the macOS accessibility tree: same word, different graph",
    description:
      "IntelliJ's built-in MCP server (IntelliJ 2025.2+) does not expose the macOS accessibility tree. It exposes IDE tools like list_directory_tree and get_symbol_info. To walk a real macOS AX tree from an MCP server you need a native binary that calls AXUIElementCreateApplication on the target PID. Worked example with Swift source from whatsapp-mcp-macos.",
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

export default function IntellijMcpAccessibilityTreePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="pb-24">
        <div className="max-w-4xl mx-auto px-6 pt-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
            guide / mcp + accessibility
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.1]">
            IntelliJ MCP and the macOS accessibility tree are two different
            graphs.
          </h1>
          <p className="text-base md:text-lg text-zinc-700 mb-5 max-w-2xl">
            They share the word &ldquo;tree&rdquo; and they each ship an MCP
            server. That is where the resemblance ends. One walks the IDE&rsquo;s
            project view inside the JVM. The other walks the OS-level{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">AXUIElement</code>{" "}
            graph of any running app via{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">kAXChildrenAttribute</code>.
            They are not interchangeable, they don&rsquo;t compose, and the only
            reason they keep landing on the same query is that both communities
            use the word &ldquo;tree&rdquo;.
          </p>
          <p className="text-sm md:text-base text-zinc-600 mb-2 max-w-2xl">
            Below: what each one actually exposes, the Swift code that walks an
            actual AX tree, and the seven attribute keys you need to read off
            each node if you want to build the second kind of MCP server.
          </p>
        </div>

        <div className="mt-8">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="9 min read"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 mt-12">
          <GlowCard>
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold tracking-widest uppercase text-teal-700 mb-3">
                Direct answer, verified 2026-05-07
              </p>
              <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 mb-4">
                IntelliJ&rsquo;s MCP server does not expose the macOS
                accessibility tree.
              </h2>
              <p className="text-zinc-700 leading-relaxed mb-3">
                It exposes IDE tools only:{" "}
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">list_directory_tree</code>,{" "}
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">get_symbol_info</code>,{" "}
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">find_files_by_glob</code>,{" "}
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">search_in_files_by_text</code>,{" "}
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">rename_refactoring</code>,
                and a handful of run-config and database tools. The full list is
                in JetBrains&rsquo; documentation. None of them call into the OS
                accessibility framework, and the IntelliJ MCP cannot read the
                accessibility tree of the IntelliJ window itself, let alone any
                other app.
              </p>
              <p className="text-zinc-700 leading-relaxed mb-3">
                To walk the actual macOS accessibility tree from an MCP server
                you need a separate native binary that calls{" "}
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">AXUIElementCreateApplication(pid)</code>{" "}
                on the target app and recurses through{" "}
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">kAXChildrenAttribute</code>.
                That is what{" "}
                <a
                  href="https://github.com/m13v/whatsapp-mcp-macos"
                  className="text-teal-700 hover:text-teal-600 underline"
                >
                  whatsapp-mcp-macos
                </a>{" "}
                does at{" "}
                <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">Sources/WhatsAppMCP/main.swift</code>{" "}
                lines 95 to 176.
              </p>
              <p className="text-zinc-600 text-sm">
                Authoritative source for the IntelliJ side:{" "}
                <a
                  href="https://www.jetbrains.com/help/idea/mcp-server.html"
                  className="text-teal-700 hover:text-teal-600 underline"
                >
                  jetbrains.com/help/idea/mcp-server.html
                </a>
                . Authoritative source for the macOS AX side:{" "}
                <a
                  href="https://developer.apple.com/documentation/applicationservices/axuielement_h"
                  className="text-teal-700 hover:text-teal-600 underline"
                >
                  developer.apple.com AXUIElement.h
                </a>
                .
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            What IntelliJ&rsquo;s MCP actually exposes
          </h2>
          <p className="text-zinc-700 mb-6">
            IntelliJ ships an MCP server starting with version 2025.2. It is a
            JetBrains plugin running inside the IDE&rsquo;s JVM, not a native
            binary. Its tool surface is the IDE: project view, files, PSI
            symbols, run configurations, refactors. Nothing in this list reaches
            into AppKit or the macOS accessibility framework.
          </p>
          <AnimatedCodeBlock
            language="text"
            filename="intellij-mcp-tools.txt"
            code={intellijMcpToolsCode}
          />
          <p className="text-zinc-600 text-sm mt-4">
            The closest IntelliJ MCP gets to a &ldquo;tree&rdquo; is{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">list_directory_tree</code>{" "}
            (a virtual-file system view) and the implicit PSI tree behind{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">get_symbol_info</code>{" "}
            and{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">rename_refactoring</code>.
            Both are code-shaped graphs, not UI graphs. Different problem,
            different MCP.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            What &ldquo;the macOS accessibility tree&rdquo; actually is
          </h2>
          <p className="text-zinc-700 mb-3">
            On macOS, every running app exposes a graph of{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">AXUIElement</code>{" "}
            nodes through the OS accessibility framework, originally for
            VoiceOver and Switch Control. Each node has a role
            (AXButton, AXTextField, AXWindow, AXGenericElement, AXLink),
            optional text attributes (description, value, title), and a screen
            position and size. Children are an attribute too, the same way every
            other field is. You walk the tree by reading{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">kAXChildrenAttribute</code>{" "}
            on the current node and recursing.
          </p>
          <p className="text-zinc-700 mb-6">
            Reaching this graph from your code means calling C-level functions
            in the ApplicationServices framework, with a process id as the
            entry point. From the JVM that is JNI; from a Swift or Objective-C
            binary it is a few function calls. An MCP server that targets this
            graph has to be the second kind of binary, not the first.
          </p>
          <AnimatedCodeBlock
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift (lines 95 to 176)"
            code={axTreeCode}
          />
          <p className="text-zinc-600 text-sm mt-4">
            The full function with all the role and text filtering lives in the
            repo at{" "}
            <a
              href="https://github.com/m13v/whatsapp-mcp-macos/blob/main/Sources/WhatsAppMCP/main.swift"
              className="text-teal-700 hover:text-teal-600 underline"
            >
              Sources/WhatsAppMCP/main.swift
            </a>
            . The seven attribute constants in the snippet above are the entire
            shopping list of AX keys you need for an LLM-friendly representation
            of a window.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            Side by side: same word, different graph
          </h2>
          <ComparisonTable
            productName="macOS AX-tree MCP (e.g. whatsapp-mcp-macos)"
            competitorName="IntelliJ built-in MCP server"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            What it looks like when each one runs
          </h2>
          <p className="text-zinc-700 mb-6">
            Same MCP host, two different MCP servers, two completely different
            sets of system calls. The IntelliJ MCP stays inside the JVM. The AX
            MCP crosses into the OS through{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">AXUIElementCreateApplication</code>{" "}
            and starts walking nodes.
          </p>
          <TerminalOutput
            title="two MCP servers, two universes"
            lines={probeLines}
          />
          <p className="text-zinc-600 text-sm mt-4">
            The bottom probe is what{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">whatsapp_search</code>{" "}
            triggers under the hood: bind to the WhatsApp Desktop PID, set a
            timeout, recursively read{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">kAXChildrenAttribute</code>,
            filter to AXButtons sitting in the right half of the window, return
            a flat list of search-result rows.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            How to actually walk the macOS AX tree from an MCP server
          </h2>
          <p className="text-zinc-700 mb-6">
            If you want to build the second kind of MCP server, this is the
            shape. Five steps, all of them in{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">main.swift</code>{" "}
            of the WhatsApp MCP repo. There is no extra framework, no SDK, no
            bridge library. ApplicationServices ships with macOS.
          </p>
          <StepTimeline steps={stepData} />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            The permission check that catches stale TCC state
          </h2>
          <p className="text-zinc-700 mb-3">
            One subtle thing the JetBrains-only mental model misses: macOS
            silently denies AX calls under conditions where the OS still
            reports the process as &ldquo;trusted&rdquo;. Re-signing an app,
            moving it between{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">/Applications</code>{" "}
            and{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">~/Applications</code>,
            or a macOS update can leave the TCC database stale. The flag check
            is true; the calls return nothing.
          </p>
          <p className="text-zinc-700 mb-6">
            The fix is to do both: the flag check (so you can prompt the user)
            and a functional probe (so you know whether the AX framework is
            actually responding for this PID).
          </p>
          <AnimatedCodeBlock
            language="swift"
            filename="Sources/WhatsAppMCP/main.swift (lines 561 to 610)"
            code={accessibilityCheckCode}
          />
          <p className="text-zinc-600 text-sm mt-4">
            If the probe fails while the flag is true, the remediation is to
            remove and re-add the host app in System Settings &gt; Privacy &amp;
            Security &gt; Accessibility, then restart. The MCP returns a JSON
            error with that exact instruction so an LLM can repeat it back to
            the user without you wiring it up.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-3">
            Running both MCPs together is the right pattern
          </h2>
          <p className="text-zinc-700 mb-3">
            MCP hosts like Claude Code, Cursor, and Windsurf accept multiple MCP
            servers in one config. The IntelliJ MCP gives you tools that operate
            on code (refactor, search, run a configuration). An accessibility-
            tree MCP gives you tools that operate on the running OS (read a
            chat, click a button, type into a field, drag a window). The agent
            picks tools per request. They occupy different namespaces and do not
            collide.
          </p>
          <p className="text-zinc-700 mb-3">
            A useful end-to-end loop: the agent uses IntelliJ&rsquo;s MCP to
            read{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">get_symbol_info</code>{" "}
            on a function and{" "}
            <code className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono">replace_text_in_file</code>{" "}
            to refactor it, then uses the WhatsApp MCP to drop a one-line
            update into a group chat asking a teammate to review the diff.
            Neither MCP could do the other&rsquo;s job. Both running side by
            side cover the gap.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Wiring up an AX-tree MCP server in your stack?"
          description="Happy to walk through the AXUIElement code, the TCC pitfalls, and how the npm + Swift packaging works on a 20 minute call."
        />

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <FaqSection items={faqItems} />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Talk through MCP + macOS accessibility, 20 min."
        />
      </article>
    </>
  );
}
