import type { Metadata } from "next";
import Link from "next/link";
import { discoverGuides } from "@seo/components/server";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Guides for the WhatsApp MCP server on macOS — installation, MCP tooling, npm package management, and adjacent automation topics.",
  alternates: { canonical: "/t" },
};

export default function GuidesIndex() {
  const guides = discoverGuides();
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Guides</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
        Notes from running an MCP server in production.
      </h1>
      <p className="mt-4 text-lg text-zinc-600">
        Short, opinionated explainers on MCP, npm package management, and the corners of the
        WhatsApp automation problem we keep running into.
      </p>

      <ul className="mt-10 divide-y divide-zinc-200 border-y border-zinc-200">
        {guides.map((g) => (
          <li key={g.slug} className="py-5">
            <Link href={g.href} className="group block">
              <h2 className="text-base font-semibold text-zinc-900 group-hover:text-teal-700">
                {g.title}
              </h2>
              {g.description ? (
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">{g.description}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
