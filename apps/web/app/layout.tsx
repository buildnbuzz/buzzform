import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://form.buildnbuzz.com"),
  title: {
    template: "%s | BuzzForm",
    default: "BuzzForm - Beautiful, Type-Safe React Forms",
  },
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
  authors: [{ name: "BuildNBuzz", url: "https://buildnbuzz.com" }],
  creator: "BuildNBuzz",
  publisher: "BuildNBuzz",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://form.buildnbuzz.com",
    siteName: "BuzzForm",
    title: "BuzzForm - Beautiful, Type-Safe React Forms",
    description:
      "Build beautiful, accessible, and type-safe forms in React with BuzzForm. Schema-driven forms with full TypeScript support.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BuzzForm",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuzzForm - Beautiful, Type-Safe React Forms",
    description:
      "Build beautiful, accessible, and type-safe forms in React with BuzzForm.",
    creator: "@buildnbuzz",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
