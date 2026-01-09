import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getExampleBySlug,
  getExampleCode,
  generateExampleStaticParams,
} from "@/lib/examples";
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
      title: "Example Not Found - BuzzForm",
    };
  }

  return {
    title: `${example.name} - BuzzForm Examples`,
    description: example.description,
    openGraph: {
      title: `${example.name} - BuzzForm Examples`,
      description: example.description,
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
