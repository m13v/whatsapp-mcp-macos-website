import type { Metadata } from "next";
import { HeadingAnchors, FullSiteAnalytics, NewsletterSignup } from "@seo/components";
import { SiteSidebar } from "@/components/site-sidebar";
import { GuideChat } from "@/components/guide-chat";
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
      <body className="bg-white text-zinc-900 antialiased">
        <FullSiteAnalytics
          posthogKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
          posthogHost={process.env.NEXT_PUBLIC_POSTHOG_HOST}
        >
          <div className="flex min-h-screen">
            <SiteSidebar />
            <main className="flex-1 min-w-0">
              <HeadingAnchors />
              {children}
            </main>
            <GuideChat />
          </div>
          <NewsletterSignup />
        </FullSiteAnalytics>
      </body>
    </html>
  );
}
