import Link from "next/link";

export function TrustNotice({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-relaxed text-teal-950 ${className}`.trim()}>
      <strong className="font-semibold">Independent open-source project.</strong>{" "}
      WhatsApp MCP for macOS is not affiliated with, endorsed by, or sponsored by
      WhatsApp LLC or Meta Platforms. It never asks for your WhatsApp password,
      QR code, Meta credentials, or payment details.{" "}
      <Link href="/safety" className="font-medium text-teal-800 underline underline-offset-2">
        Review the safety notes
      </Link>
      .
    </div>
  );
}
