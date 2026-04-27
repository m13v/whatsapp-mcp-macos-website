import type { Metadata } from "next";
import { HeadingAnchors, FullSiteAnalytics } from "@seo/components";
import { SiteSidebar } from "@/components/site-sidebar";
import { GuideChat } from "@/components/guide-chat";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "WhatsApp MCP for macOS",
    template: "%s — WhatsApp MCP for macOS",
  },
  description:
    "MCP server that drives the native WhatsApp desktop app on macOS through accessibility APIs. No Meta Business API keys, no browser automation.",
  metadataBase: new URL("https://whatsapp-mcp-macos.com"),
  openGraph: {
    siteName: "WhatsApp MCP for macOS",
    type: "website",
    url: "https://whatsapp-mcp-macos.com",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "WhatsApp MCP for macOS",
  url: "https://whatsapp-mcp-macos.com",
  sameAs: ["https://github.com/m13v/whatsapp-mcp-macos"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-zinc-900 antialiased">
        <FullSiteAnalytics
          posthogKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
          posthogHost={process.env.NEXT_PUBLIC_POSTHOG_HOST}
        >
          <HeadingAnchors />
          <div className="flex min-h-screen">
            <SiteSidebar />
            <div className="flex min-w-0 flex-1 flex-col">{children}</div>
            <GuideChat />
          </div>
        </FullSiteAnalytics>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  );
}
