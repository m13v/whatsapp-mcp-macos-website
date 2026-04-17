import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsApp MCP for macOS",
  description:
    "MCP server that drives the native WhatsApp desktop app on macOS through accessibility APIs. No Meta Business API keys, no browser automation.",
  metadataBase: new URL("https://whatsapp-mcp-macos.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
