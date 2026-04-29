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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://whatsapp-mcp-macos.com/#organization",
      name: "WhatsApp MCP for macOS",
      url: "https://whatsapp-mcp-macos.com",
      logo: "https://whatsapp-mcp-macos.com/logo.png",
      sameAs: ["https://github.com/m13v/whatsapp-mcp-macos"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://whatsapp-mcp-macos.com/#software",
      name: "WhatsApp MCP for macOS",
      url: "https://whatsapp-mcp-macos.com",
      applicationCategory: "DeveloperApplication",
      applicationSubCategory: "Model Context Protocol server",
      operatingSystem: "macOS",
      description:
        "Open-source MCP server that drives the native WhatsApp desktop app on macOS through accessibility APIs. No Meta Business API keys, no browser automation. Send messages, read chats, search contacts, and verify delivery from Claude, Cursor, Windsurf, or any MCP client.",
      author: { "@id": "https://whatsapp-mcp-macos.com/#organization" },
      publisher: { "@id": "https://whatsapp-mcp-macos.com/#organization" },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "Open source, free to use",
      },
      featureList: [
        "Send WhatsApp messages",
        "Read chats and message history",
        "Search contacts and groups",
        "Verify message delivery",
        "macOS accessibility API based, no browser automation",
        "No Meta Business API keys required",
        "Compatible with Claude, Cursor, Windsurf, and any MCP client",
      ],
      isAccessibleForFree: true,
      sameAs: ["https://github.com/m13v/whatsapp-mcp-macos"],
    },
    {
      "@type": "WebSite",
      "@id": "https://whatsapp-mcp-macos.com/#website",
      name: "WhatsApp MCP for macOS",
      url: "https://whatsapp-mcp-macos.com",
      publisher: { "@id": "https://whatsapp-mcp-macos.com/#organization" },
    },
    {
      "@type": "WebPage",
      "@id": "https://whatsapp-mcp-macos.com/#webpage",
      url: "https://whatsapp-mcp-macos.com",
      name: "WhatsApp MCP for macOS",
      isPartOf: { "@id": "https://whatsapp-mcp-macos.com/#website" },
      about: { "@id": "https://whatsapp-mcp-macos.com/#software" },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "#how-it-works", "#features", "#faq"],
      },
    },
  ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
