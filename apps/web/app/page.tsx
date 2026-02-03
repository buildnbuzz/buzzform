import type { Metadata } from "next";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { UsageSection } from "@/components/landing/usage-section";
import { SiteHeader } from "@/components/landing/site-header";
import { BuilderCtaSection } from "@/components/landing/builder-cta-section";

export const metadata: Metadata = {
  title: "BuzzForm - Beautiful, Type-Safe React Forms",
  description:
    "Build beautiful, accessible, and type-safe forms in React with BuzzForm. Schema-driven forms with full TypeScript support, built on shadcn/ui components.",
  keywords: [
    "react forms",
    "typescript forms",
    "schema-driven forms",
    "shadcn ui",
    "form builder",
    "react form library",
    "type-safe forms",
    "zod forms",
    "accessible forms",
  ],
  openGraph: {
    title: "BuzzForm - Beautiful, Type-Safe React Forms",
    description:
      "Build beautiful, accessible, and type-safe forms in React with BuzzForm. Schema-driven forms with full TypeScript support.",
    url: "https://form.buildnbuzz.com",
    siteName: "BuzzForm",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BuzzForm - Beautiful, Type-Safe React Forms",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuzzForm - Beautiful, Type-Safe React Forms",
    description:
      "Build beautiful, accessible, and type-safe forms in React with BuzzForm.",
    images: ["/og-image.png"],
    creator: "@buildnbuzz",
  },
  alternates: {
    canonical: "https://form.buildnbuzz.com",
  },
};

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />
      <main className="flex-1 mx-auto">
        <HeroSection />
        <UsageSection />
        <FeaturesSection />
        <BuilderCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
