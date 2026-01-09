import type { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ExamplesNav } from "@/components/examples-nav";
import { ExamplesHeader } from "@/components/examples-header";

export const metadata: Metadata = {
  title: "Examples",
  description:
    "Interactive examples of BuzzForm components and layouts. Explore real-world form implementations with live code previews.",
  keywords: [
    "buzzform examples",
    "form examples",
    "react form examples",
    "form components",
    "interactive examples",
  ],
  openGraph: {
    title: "BuzzForm Examples - Interactive Form Components",
    description:
      "Interactive examples of BuzzForm components and layouts. Explore real-world form implementations with live code previews.",
    url: "https://buzzform.buildnbuzz.com/examples",
    siteName: "BuzzForm",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BuzzForm Examples",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuzzForm Examples - Interactive Form Components",
    description:
      "Interactive examples of BuzzForm components and layouts. Explore real-world form implementations.",
    images: ["/og-image.png"],
    creator: "@buildnbuzz",
  },
  alternates: {
    canonical: "https://buzzform.buildnbuzz.com/examples",
  },
};

export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ExamplesNav />
      <SidebarInset>
        <ExamplesHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
