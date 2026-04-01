import { source, getRawPageContent } from "@/lib/source";
import { DocsCopyPage } from "@/components/docs/docs-copy-page";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/components/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  const rawContent = await getRawPageContent(page.slugs);
  const pageUrl = `https://form.buildnbuzz.com/docs/${page.slugs.join("/")}`;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <div className="flex items-center justify-between">
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsCopyPage content={rawContent} url={pageUrl} />
      </div>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
