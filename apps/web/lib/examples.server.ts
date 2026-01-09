import "server-only";
import fs from "fs/promises";
import path from "path";
import { getExampleBySlug, type Example } from "./examples";

/**
 * Read example source code from the filesystem.
 * This is designed to be called from RSC (server components) directly.
 * 
 * @server-only - This file uses Node.js fs module and can only be used server-side.
 */
export async function getExampleCode(
    filename: string
): Promise<{ content: string | null; error: string | null }> {
    // Try multiple possible paths to handle different CWDs (monorepo root vs app root)
    const possiblePaths = [
        // If CWD is apps/web
        path.join(process.cwd(), "components/examples", filename),
        // If CWD is monorepo root
        path.join(process.cwd(), "apps/web/components/examples", filename),
    ];

    for (const filePath of possiblePaths) {
        try {
            const content = await fs.readFile(filePath, "utf-8");
            return { content, error: null };
        } catch {
            // Continue to next path
        }
    }

    return {
        content: null,
        error: `Could not find file ${filename}`,
    };
}

/**
 * Get example with its source code pre-loaded.
 * Perfect for RSC pages that need both metadata and code.
 * 
 * @server-only - This function uses filesystem access.
 */
export async function getExampleWithCode(slug: string): Promise<{
    example: Example | null;
    code: string | null;
    error: string | null;
}> {
    const example = getExampleBySlug(slug);

    if (!example) {
        return {
            example: null,
            code: null,
            error: `Example "${slug}" not found`,
        };
    }

    const { content, error } = await getExampleCode(example.file);

    return {
        example,
        code: content,
        error,
    };
}
