"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { withBookingAttribution } from "@seo/components";
import { BOOKING_URL, trackBookingClick } from "@/lib/booking";

export function BookCallLink({
  children,
  className,
  section,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  section?: string;
  onClick?: () => void;
}) {
  const text = typeof children === "string" ? children : undefined;
  const [href, setHref] = useState(BOOKING_URL);
  useEffect(() => {
    setHref(withBookingAttribution(BOOKING_URL));
  }, []);
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        trackBookingClick({ section, text, component: "BookCallLink" });
        onClick?.();
      }}
    >
      {children}
    </Link>
  );
}
