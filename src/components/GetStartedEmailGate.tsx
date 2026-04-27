"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackGetStartedClick } from "@seo/components";
import { GITHUB_URL, NPM_INSTALL_CMD, NPM_PACKAGE } from "@/lib/get-started";

const NPM_COMMAND = NPM_INSTALL_CMD;
const CLAUDE_CONFIG = `{
  "mcpServers": {
    "whatsapp": {
      "command": "${NPM_PACKAGE}",
      "transport": "stdio"
    }
  }
}`;

type Stage = "closed" | "email" | "command";

export function GetStartedEmailGate({
  label = "Get the install command",
  section = "hero",
  className = "",
  variant = "primary",
}: {
  label?: string;
  section?: string;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const [stage, setStage] = useState<Stage>("closed");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"npm" | "config" | null>(null);

  useEffect(() => {
    if (stage === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStage("closed");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage]);

  useEffect(() => {
    if (stage === "closed") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [stage]);

  const onOpen = () => {
    trackGetStartedClick({
      destination: "modal:email",
      site: "whatsapp-mcp-macos",
      section,
      text: label,
    });
    setStage("email");
    setError("");
  };

  const onSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status >= 400 && res.status < 500) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save that email. Try again.");
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        console.warn("[GetStartedEmailGate] newsletter POST failed", res.status);
      }
      trackGetStartedClick({
        destination: "modal:command",
        site: "whatsapp-mcp-macos",
        section,
        text: "email-submitted",
      });
      setStage("command");
    } catch (err) {
      console.warn("[GetStartedEmailGate] newsletter POST network error", err);
      setStage("command");
    } finally {
      setSubmitting(false);
    }
  };

  const copy = async (which: "npm" | "config", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  const buttonClass =
    variant === "primary"
      ? "group inline-flex h-11 items-center gap-2 rounded-md bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      : "inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-400";

  return (
    <>
      <button type="button" onClick={onOpen} className={`${buttonClass} ${className}`.trim()}>
        {label}
        {variant === "primary" && (
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {stage !== "closed" && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 px-4 backdrop-blur-sm"
            onClick={() => setStage("closed")}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {stage === "email" && (
                <div className="p-7">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                        Get the install command
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                        Drop your email and we&apos;ll show you the one-line install plus the
                        occasional update. No spam.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStage("closed")}
                      className="-mr-2 -mt-2 rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                      aria-label="Close"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={onSubmitEmail} className="space-y-3">
                    <input
                      type="email"
                      autoFocus
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      disabled={submitting}
                    />
                    {error && <p className="text-xs font-medium text-red-600">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
                    >
                      {submitting ? "Sending…" : "Show me the command"}
                    </button>
                  </form>
                  <p className="mt-4 text-xs text-zinc-500">
                    Already subscribed? Submit anyway, the command unlocks either way.
                  </p>
                </div>
              )}

              {stage === "command" && (
                <div className="p-7">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                        Run this on your Mac
                      </h2>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                        macOS 13+, with the WhatsApp desktop app installed. Postinstall compiles
                        the Swift binary.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStage("closed")}
                      className="-mr-2 -mt-2 rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                      aria-label="Close"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    1. Install
                  </p>
                  <div className="relative mt-2 overflow-hidden rounded-md border border-zinc-200 bg-zinc-950">
                    <pre className="overflow-x-auto px-4 py-3.5 font-mono text-sm text-zinc-100">
                      <code>
                        <span className="text-zinc-500">$ </span>
                        {NPM_COMMAND}
                      </code>
                    </pre>
                    <button
                      type="button"
                      onClick={() => copy("npm", NPM_COMMAND)}
                      className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700"
                    >
                      {copied === "npm" ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    2. Add to your MCP client config
                  </p>
                  <div className="relative mt-2 overflow-hidden rounded-md border border-zinc-200 bg-zinc-950">
                    <pre className="overflow-x-auto px-4 py-3.5 font-mono text-xs text-zinc-100">
                      <code>{CLAUDE_CONFIG}</code>
                    </pre>
                    <button
                      type="button"
                      onClick={() => copy("config", CLAUDE_CONFIG)}
                      className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700"
                    >
                      {copied === "config" ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-zinc-500">
                    Drop the JSON into <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px]">~/.claude.json</code>{" "}
                    (Claude Code) or your client&apos;s equivalent, then restart the client. Grant
                    Accessibility permission to the host app on first run.
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-teal-700 hover:text-teal-800"
                    >
                      View on GitHub →
                    </a>
                    <button
                      type="button"
                      onClick={() => setStage("closed")}
                      className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
