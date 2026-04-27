"use client";

import Link from "next/link";
import { useState } from "react";
import { BookCallLink } from "@/components/BookCallLink";
import { GetStartedEmailGate } from "@/components/GetStartedEmailGate";
import { GITHUB_URL } from "@/lib/get-started";

const navLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/t", label: "Guides" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-zinc-900">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-teal-500 text-white text-sm font-bold">w</span>
          <span>WhatsApp MCP</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
          >
            GitHub
          </a>
          <BookCallLink
            section="header"
            className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
          >
            Book a call
          </BookCallLink>
          <GetStartedEmailGate label="Install" section="header" variant="primary" className="h-9 px-3.5" />
        </nav>

        <button
          type="button"
          aria-label="Toggle navigation"
          className="md:hidden p-2 text-zinc-700"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen ? (
        <nav className="border-t border-zinc-100 bg-white px-5 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              GitHub
            </a>
            <BookCallLink
              section="header-mobile"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-2 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Book a call
            </BookCallLink>
            <div className="mt-2">
              <GetStartedEmailGate label="Install" section="header-mobile" variant="primary" />
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
