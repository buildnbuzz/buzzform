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
  filename: string,
  // ID is no longer needed but kept for signature compatibility if desired,
  // though we can remove it if we update callsites.
  // In this refactor, we ignore it as files are 1:1.
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  _componentId?: string,
): Promise<{ content: string | null; error: string | null }> {
  // Path to the new registry location
  const possiblePaths = [
    // If CWD is apps/web
    path.join(process.cwd(), "registry/shadcn/examples", filename),
    // If CWD is monorepo root
    path.join(process.cwd(), "apps/web/registry/shadcn/examples", filename),
  ];

  for (const filePath of possiblePaths) {
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const transformedContent = transformIconPlaceholder(fileContent);
      return { content: transformedContent, error: null };
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
 * Transforms IconPlaceholder components into direct Hugeicons imports.
 * This is used for the "View Code" feature to show cleaner code to users.
 */
function transformIconPlaceholder(content: string): string {
  // 1. Find all IconPlaceholder usages and extract metadata
  const iconMatches = Array.from(
    content.matchAll(/<IconPlaceholder[\s\S]*?\/>/g),
  );
  const usedIcons = new Set<string>();

  let transformed = content;

  // 2. Replace each usage with the actual icon component
  for (const match of iconMatches) {
    const fullTag = match[0];

    // Extract hugeicons name
    const nameMatch = fullTag.match(/hugeicons="([^"]+)"/);
    const iconName = nameMatch?.[1];

    // Extract className (optional)
    const classMatch = fullTag.match(/className="([^"]+)"/);
    const className = classMatch?.[1];

    if (iconName) {
      usedIcons.add(iconName);

      // Reconstruct as HugeiconsIcon wrapper: <HugeiconsIcon icon={IconName} className="..." />
      let replacement = `<HugeiconsIcon icon={${iconName}}`;
      if (className) {
        replacement += ` className="${className}"`;
      }
      replacement += " />";

      transformed = transformed.replace(fullTag, replacement);
    }
  }

  // 3. Remove IconPlaceholder import
  transformed = transformed.replace(
    /import\s*{\s*IconPlaceholder\s*}\s*from\s*"@\/components\/icon-placeholder";\s*/,
    "",
  );

  // 4. Add Hugeicons imports if icons were found
  if (usedIcons.size > 0) {
    const sortedIcons = Array.from(usedIcons).sort().join(", ");

    // We need two imports: one for icons, one for the wrapper
    const importsToAdd = [
      `import { ${sortedIcons} } from "@hugeicons/core-free-icons";`,
      `import { HugeiconsIcon } from "@hugeicons/react";`,
    ].join("\n");

    // Try to insert after the last import
    const lastImportRegex = /import.*?from.*?;/g;
    let lastImportMatch;
    let match;
    while ((match = lastImportRegex.exec(transformed)) !== null) {
      lastImportMatch = match;
    }

    if (lastImportMatch) {
      const insertIndex = lastImportMatch.index + lastImportMatch[0].length;
      transformed =
        transformed.slice(0, insertIndex) +
        "\n" +
        importsToAdd +
        transformed.slice(insertIndex);
    } else {
      // No imports found? Add after "use client" or at top
      if (transformed.includes('"use client";')) {
        transformed = transformed.replace(
          '"use client";',
          '"use client";\n\n' + importsToAdd,
        );
      } else {
        transformed = importsToAdd + "\n\n" + transformed;
      }
    }
  }

  // Cleanup extra newlines that might have resulted from removing imports
  transformed = transformed.replace(/\n\s*\n\s*\n/g, "\n\n");

  return transformed;
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

  const { content, error } = await getExampleCode(example.file, example.id);

  return {
    example,
    code: content,
    error,
  };
}
