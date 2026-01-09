import { MetadataRoute } from "next";
import { allExamples } from "@/lib/examples";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://form.buildnbuzz.com";

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/examples`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/docs`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
    ];

    // Example pages
    const examplePages: MetadataRoute.Sitemap = allExamples.map((example) => ({
        url: `${baseUrl}/examples/${example.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    // Documentation pages from Fumadocs
    const docsPages: MetadataRoute.Sitemap = source.getPages().map((page) => ({
        url: `${baseUrl}${page.url}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    return [...staticPages, ...examplePages, ...docsPages];
}
