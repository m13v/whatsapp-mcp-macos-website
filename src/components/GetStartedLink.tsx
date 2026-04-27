"use client";

import Link from "next/link";
import { GET_STARTED_URL, fireGetStartedClick } from "@/lib/get-started";

export function GetStartedLink({
  children,
  className,
  section,
  href,
  external,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  section?: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const text = typeof children === "string" ? children : undefined;
  const target = href ?? GET_STARTED_URL;
  return (
    <Link
      href={target}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
      onClick={() => {
        fireGetStartedClick({ section, text, component: "GetStartedLink", destination: target });
        onClick?.();
      }}
    >
      {children}
    </Link>
  );
}
