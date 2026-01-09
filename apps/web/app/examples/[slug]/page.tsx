import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getExampleBySlug, generateExampleStaticParams } from "@/lib/examples";
import { getExampleCode } from "@/lib/examples.server";
import { ExampleViewer } from "@/components/example-viewer";

interface ExamplePageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static pages for all examples at build time.
 */
export function generateStaticParams() {
  return generateExampleStaticParams();
}

/**
 * Generate metadata for each example page.
 */
export async function generateMetadata({
  params,
}: ExamplePageProps): Promise<Metadata> {
  const { slug } = await params;
  const example = getExampleBySlug(slug);

  if (!example) {
    return {
      title: "Example Not Found",
      description: "The requested example could not be found.",
    };
  }

  return {
    title: example.name,
    description: example.description,
    keywords: [
      "buzzform",
      example.name.toLowerCase(),
      "form example",
      "react form",
      "form component",
      "interactive example",
    ],
    openGraph: {
      title: `${example.name} - BuzzForm Examples`,
      description: example.description,
      url: `https://form.buildnbuzz.com/examples/${slug}`,
      siteName: "BuzzForm",
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${example.name} Example`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${example.name} - BuzzForm Examples`,
      description: example.description,
      images: ["/og-image.png"],
      creator: "@buildnbuzz",
    },
    alternates: {
      canonical: `https://form.buildnbuzz.com/examples/${slug}`,
    },
  };
}

/**
 * RSC Example Page - fetches code on the server.
 * The actual interactive form is in the client component ExampleViewer.
 */
export default async function ExamplePage({ params }: ExamplePageProps) {
  const { slug } = await params;
  const example = getExampleBySlug(slug);

  if (!example) {
    notFound();
  }

  // Pre-fetch code on the server - no waterfall!
  const { content: code } = await getExampleCode(example.file);

  return <ExampleViewer example={example} code={code} />;
}
