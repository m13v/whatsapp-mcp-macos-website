import type { Metadata } from "next";
import { BookCallLink } from "@/components/BookCallLink";
import { GetStartedEmailGate } from "@/components/GetStartedEmailGate";
import { GITHUB_URL, NPM_PACKAGE } from "@/lib/get-started";

export const metadata: Metadata = {
  title: "Install",
  description:
    "Install the WhatsApp MCP server on macOS. Single npm command, Swift postinstall, then register the server in Claude Desktop, Claude Code, Cursor, or any MCP client.",
  alternates: { canonical: "/install" },
};

export default function InstallPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Install</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
        Install in under a minute
      </h1>
      <p className="mt-4 text-lg text-zinc-600">
        macOS 13+ with the WhatsApp desktop app installed. Node.js 20+ for the npm install. Xcode
        Command Line Tools for the Swift compile.
      </p>

      <div className="mt-10 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
        <h2 className="text-base font-semibold text-zinc-900">Drop your email to reveal the install command</h2>
        <p className="mt-2 text-sm text-zinc-600">
          One short note when something useful ships. No spam.
        </p>
        <div className="mt-4">
          <GetStartedEmailGate label="Get the install command" section="install-page" variant="primary" />
        </div>
      </div>

      <ol className="mt-12 space-y-12">
        <li>
          <p className="font-mono text-xs text-teal-600">01</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900">Install the npm package</h2>
          <p className="mt-3 text-sm text-zinc-600">
            The postinstall script runs <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">xcrun swift build -c release</code>{" "}
            to compile the Swift binary. First install takes ~30 seconds. The exact command appears
            in the modal above once you submit your email.
          </p>
        </li>

        <li>
          <p className="font-mono text-xs text-teal-600">02</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900">Grant Accessibility permission</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            macOS requires the host app (Claude Desktop, Terminal, Cursor, Windsurf, Fazm, whichever
            launches the MCP server) to be granted Accessibility permission. Open{" "}
            <span className="font-medium text-zinc-800">System Settings → Privacy &amp; Security → Accessibility</span>,
            click the <span className="font-medium text-zinc-800">+</span> button, and add the host
            app. Toggle it on.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            If the toggle is on but tools fail, remove the entry and re-add it. The TCC database
            sometimes caches stale permissions.
          </p>
        </li>

        <li>
          <p className="font-mono text-xs text-teal-600">03</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900">Register the MCP server</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Drop the JSON config from the install modal into{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">~/.claude.json</code>{" "}
            (Claude Code) or the equivalent file for your MCP client. Restart the client. The
            WhatsApp MCP server should appear in the available tool list.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            Suppressed for the unauthenticated view; the modal above contains the exact JSON for{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">{NPM_PACKAGE}</code>.
          </p>
        </li>

        <li>
          <p className="font-mono text-xs text-teal-600">04</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900">Try it</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Open WhatsApp on your Mac (the server expects the app to be running). Then ask your
            assistant something like <span className="italic">&ldquo;Search WhatsApp for Mom and tell me her last
            three messages.&rdquo;</span>
          </p>
        </li>
      </ol>

      <div className="mt-16 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
        <h2 className="text-base font-semibold text-zinc-900">Stuck on something?</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Open an issue on GitHub or book a 15-minute call with the maintainer.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:border-zinc-400"
          >
            GitHub issues
          </a>
          <BookCallLink
            section="install-help"
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Book 15 min
          </BookCallLink>
        </div>
      </div>
    </div>
  );
}
