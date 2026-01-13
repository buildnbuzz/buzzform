import "server-only";
import fs from "fs/promises";
import path from "path";
import { getExampleBySlug, type Example } from "./examples";

/**
 * Extract a specific component and its dependencies from a TypeScript file.
 * This extracts:
 * - The "use client" directive if present
 * - Necessary imports
 * - The schema definition used by the component
 * - The component function itself
 */
function extractComponentCode(fileContent: string, componentName: string): string {
    const lines = fileContent.split('\n');
    const result: string[] = [];

    // 1. Add "use client" if present
    if (lines[0]?.trim() === '"use client";') {
        result.push('"use client";', '');
    }

    // 2. Extract imports (everything from start until first non-import line after imports)
    const importLines: string[] = [];
    let inImportSection = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('import ')) {
            inImportSection = true;
            importLines.push(line);
        } else if (inImportSection && trimmed === '') {
            // Empty line after imports - continue collecting
            importLines.push(line);
        } else if (inImportSection && !trimmed.startsWith('import ')) {
            // End of import section
            break;
        }
    }
    result.push(...importLines);
    if (importLines.length > 0) {
        result.push('');
    }

    // 3. Find the schema variable used by this component
    // Look for pattern: schema={schemaName} in the component
    const componentStartIndex = fileContent.indexOf(`export function ${componentName}`);
    if (componentStartIndex === -1) {
        // Component not found, return entire file as fallback
        return fileContent;
    }

    const componentSection = fileContent.substring(componentStartIndex);
    const schemaMatch = componentSection.match(/schema=\{(\w+)\}/);

    if (schemaMatch) {
        const schemaName = schemaMatch[1];

        // Find the schema definition
        const schemaRegex = new RegExp(`const ${schemaName} = createSchema\\([\\s\\S]*?\\]\\);`, 'm');
        const schemaDefinition = fileContent.match(schemaRegex);

        if (schemaDefinition) {
            result.push(schemaDefinition[0], '');
        }
    }

    // 4. Extract the component function
    // Find the start of the component
    const componentRegex = new RegExp(
        `export function ${componentName}\\([^)]*\\)[^{]*\\{`,
        's'
    );
    const componentMatch = fileContent.match(componentRegex);

    if (!componentMatch) {
        // Fallback to entire file if we can't parse
        return fileContent;
    }

    // Find matching closing brace
    let braceCount = 0;
    let componentCode = '';
    let started = false;

    for (let i = componentStartIndex; i < fileContent.length; i++) {
        const char = fileContent[i];
        componentCode += char;

        if (char === '{') {
            braceCount++;
            started = true;
        } else if (char === '}') {
            braceCount--;
            if (started && braceCount === 0) {
                break;
            }
        }
    }

    result.push(componentCode);

    return result.join('\n');
}

/**
 * Read example source code from the filesystem and extract the specific component.
 * This is designed to be called from RSC (server components) directly.
 * 
 * @server-only - This file uses Node.js fs module and can only be used server-side.
 */
export async function getExampleCode(
    filename: string,
    componentName?: string
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
            const fileContent = await fs.readFile(filePath, "utf-8");

            // If a component name is provided, extract just that component
            const content = componentName
                ? extractComponentCode(fileContent, componentName)
                : fileContent;

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

    const { content, error } = await getExampleCode(example.file, example.id);

    return {
        example,
        code: content,
        error,
    };
}
