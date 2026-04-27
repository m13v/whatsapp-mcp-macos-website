import Link from "next/link";
import { GITHUB_URL } from "@/lib/get-started";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-semibold tracking-tight text-zinc-900">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-teal-500 text-white text-sm font-bold">w</span>
            <span>WhatsApp MCP</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-zinc-600">
            MCP server that drives the native WhatsApp desktop app on macOS through accessibility APIs.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Product</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/install" className="text-zinc-700 hover:text-zinc-900">Install</Link></li>
            <li><Link href="/precall" className="text-zinc-700 hover:text-zinc-900">Book a call</Link></li>
            <li><Link href="/faq" className="text-zinc-700 hover:text-zinc-900">FAQ</Link></li>
            <li><Link href="/t" className="text-zinc-700 hover:text-zinc-900">Guides</Link></li>
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-zinc-700 hover:text-zinc-900">
                GitHub
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Site</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/sitemap" className="text-zinc-700 hover:text-zinc-900">Sitemap</Link></li>
            <li><Link href="/privacy" className="text-zinc-700 hover:text-zinc-900">Privacy</Link></li>
            <li>
              <a href="/llms.txt" className="text-zinc-700 hover:text-zinc-900">llms.txt</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-200">
        <div className="mx-auto max-w-5xl px-5 py-5 text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} WhatsApp MCP for macOS. Open source on GitHub.
        </div>
      </div>
    </footer>
  );
}
