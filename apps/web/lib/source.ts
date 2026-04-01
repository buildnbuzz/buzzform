import { docs } from "fumadocs-mdx:collections/server";
import { loader } from "fumadocs-core/source";
import fs from "fs/promises";
import path from "path";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

export async function getRawPageContent(slugs: string[]): Promise<string> {
  const fileSlug = slugs.length > 0 ? slugs.join("/") : "index";
  const filePath = path.join(process.cwd(), "content/docs", `${fileSlug}.mdx`);

  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (e) {
    console.error("Failed to read raw content for page", slugs.join("/"), e);
    return "";
  }
}
