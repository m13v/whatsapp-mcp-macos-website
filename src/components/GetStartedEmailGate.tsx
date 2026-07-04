"use client";

import { GetStartedLink } from "@/components/GetStartedLink";

export function GetStartedEmailGate({
  label = "Install from npm",
  section = "hero",
  className = "",
  variant = "primary",
}: {
  label?: string;
  section?: string;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const classes =
    variant === "primary"
      ? "inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      : "inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-400";

  return (
    <GetStartedLink section={section} className={`${classes} ${className}`.trim()}>
      {label}
    </GetStartedLink>
  );
}
