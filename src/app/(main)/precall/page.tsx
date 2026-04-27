import type { Metadata } from "next";
import { BookCallLink } from "@/components/BookCallLink";
import { GetStartedLink } from "@/components/GetStartedLink";
import { GITHUB_URL } from "@/lib/get-started";

export const metadata: Metadata = {
  title: "Book a call",
  description:
    "15 minutes with the maintainer of WhatsApp MCP for macOS. Talk through your automation idea, agent setup, or integration question.",
  alternates: { canonical: "/precall" },
};

const goodFits = [
  "You want Claude, Cursor, or your own agent to send and read WhatsApp messages on macOS.",
  "You're building an automation that needs WhatsApp reach but the Business API is the wrong shape.",
  "You're embedding the MCP server in a larger product (Fazm-style assistant, executive ops tooling, etc.).",
  "You hit an accessibility-permission wall and want a second pair of eyes.",
];

const notFits = [
  "You need high-volume opt-in template broadcasts. Use the Meta Business Cloud API, not this.",
  "You're on Windows or Linux without macOS in the loop.",
  "You're building a competing WhatsApp automation product.",
];

export default function PrecallPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Book a call</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
        15 minutes with the maintainer.
      </h1>
      <p className="mt-4 text-lg text-zinc-600">
        Free, no slides, no pitch. Bring an automation idea, an agent setup, or a stuck install and
        we&rsquo;ll talk through it.
      </p>

      <div className="mt-10 overflow-hidden rounded-lg border border-zinc-200">
        <iframe
          src="https://cal.com/team/mediar/whatsapp-mcp?embed_type=Inline&hide_event_type_details=1"
          width="100%"
          height="780"
          frameBorder={0}
          title="Book a call"
          className="block h-[780px] w-full"
        />
      </div>

      <div className="mt-6 text-sm text-zinc-600">
        Trouble loading?{" "}
        <BookCallLink section="precall-fallback" className="font-medium text-teal-700 hover:text-teal-800">
          Open the booking page in a new tab.
        </BookCallLink>
      </div>

      <div className="mt-16 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Good fit</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            {goodFits.map((s) => (
              <li key={s} className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Not a fit</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            {notFits.map((s) => (
              <li key={s} className="flex gap-3">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
        <p className="text-sm text-zinc-600">
          Prefer to keep it async?{" "}
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-700 hover:text-teal-800">
            Open a GitHub issue
          </a>{" "}
          or{" "}
          <GetStartedLink href="/install" section="precall-cta-async" className="font-medium text-teal-700 hover:text-teal-800">
            install it yourself
          </GetStartedLink>
          .
        </p>
      </div>
    </div>
  );
}
