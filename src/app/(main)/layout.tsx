import { NewsletterSignup } from "@seo/components";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <NewsletterSignup
        description="One short email when something useful ships. No spam."
        buttonLabel="Subscribe"
        successMessage="Subscribed. Check your inbox."
      />
    </div>
  );
}
