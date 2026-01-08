import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { UsageSection } from "@/components/landing/usage-section";
import { SiteHeader } from "@/components/landing/site-header";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />
      <main className="flex-1 mx-auto">
        <HeroSection />
        <UsageSection />
        <FeaturesSection />
      </main>
      <SiteFooter />
    </div>
  );
}
