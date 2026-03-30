import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const DOCS_ROOT = path.join(process.cwd(), "apps/web/content/docs");

/**
 * Recursively find all files matching a pattern in a directory.
 */
function findFiles(dir: string, pattern: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, pattern));
    } else if (entry.isFile() && entry.name.endsWith(pattern)) {
      results.push(path.relative(process.cwd(), fullPath));
    }
  }
  
  return results;
}

/**
 * Property 1: No deprecated import paths in code examples
 * 
 * For any code block in any MDX file under apps/web/content/docs/,
 * the import path `@buildnbuzz/buzzform` must not appear.
 * 
 * Validates: Requirements 19.1
 */
describe("Documentation Correctness", () => {
  it("Property 1: No deprecated import paths in code examples", () => {
    const files = findFiles(DOCS_ROOT, ".mdx");
    
    for (const file of files) {
      // Skip migration guide - it intentionally shows old imports for comparison
      if (file.endsWith("migration.mdx")) continue;
      // Skip fields/types.mdx - it has a callout mentioning the old package
      if (file.endsWith("fields/types.mdx")) continue;
      // Skip installation.mdx - it has a deprecation callout (not actual usage)
      if (file.endsWith("installation.mdx")) continue;
      
      const content = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      
      // Check for actual import statements, not just mentions in callouts
      const codeBlockPattern = /```(?:tsx|ts|bash|package-install)[\s\S]*?import[\s\S]*?@buildnbuzz\/buzzform[\s\S]*?```/g;
      expect(content).not.toMatch(codeBlockPattern);
    }
  });

  /**
   * Property 2: No function-based condition syntax in examples
   * 
   * For any code block in any MDX file that assigns a value to
   * condition, hidden, disabled, readOnly, or required, that value
   * must not be an arrow function or function expression.
   * 
   * Validates: Requirements 19.2
   */
  it("Property 2: No function-based condition syntax in examples", () => {
    const files = findFiles(DOCS_ROOT, ".mdx");
    const pattern = /\b(condition|hidden|disabled|readOnly|required)\s*:\s*(\(|[a-z]\w*\s*=>)/;
    
    for (const file of files) {
      // Skip migration guide - it intentionally shows old function syntax for comparison
      if (file.endsWith("migration.mdx")) continue;
      
      const content = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      expect(content).not.toMatch(pattern);
    }
  });

  /**
   * Property 3: No function-based validation syntax in examples
   * 
   * For any code block in any MDX file that assigns a value to
   * the validate field property, that value must be a ValidationConfig
   * object with a checks array — not a (value) => string function.
   * 
   * Validates: Requirements 19.3
   */
  it("Property 3: No function-based validation syntax in examples", () => {
    const files = findFiles(DOCS_ROOT, ".mdx");
    const pattern = /\bvalidate\s*:\s*(\(|async\s*\(|[a-z]\w*\s*=>)/;
    
    for (const file of files) {
      // Skip migration guide - it intentionally shows old function syntax for comparison
      if (file.endsWith("migration.mdx")) continue;
      
      const content = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      expect(content).not.toMatch(pattern);
    }
  });

  /**
   * Property 4: All navigation slugs have a corresponding MDX file
   * 
   * For any slug in any meta.json pages array (excluding --- separators
   * and ...spread references), a corresponding .mdx file must exist.
   * 
   * Validates: Requirements 18.2, 18.3
   */
  it("Property 4: All navigation slugs have a corresponding MDX file", () => {
    const metaFiles = findFiles(DOCS_ROOT, ".json").filter(f => f.endsWith("meta.json"));
    
    for (const metaFile of metaFiles) {
      const metaContent = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), metaFile), "utf8")
      );
      const pages = metaContent.pages || [];
      const metaDir = path.dirname(metaFile);
      
      for (const page of pages) {
        // Skip separators and spread references
        if (page.startsWith("---") || page.startsWith("...")) continue;
        
        const mdxPath = path.join(metaDir, `${page}.mdx`);
        expect(
          fs.existsSync(path.join(process.cwd(), mdxPath))
        ).toBe(true);
      }
    }
  });

  /**
   * Property 5: Every field type has a reference page
   * 
   * For any field type string in the DataField | LayoutField union,
   * a corresponding .mdx file must exist under fields/data/ or fields/layout/.
   * 
   * Validates: Requirements 14.1, 15.1
   */
  it("Property 5: Every field type has a reference page", () => {
    const dataFields = [
      "text", "email", "password", "textarea", "number",
      "select", "date", "tags", "checkbox", "switch", "radio"
    ];
    const layoutFields = ["row", "group", "collapsible", "tabs", "array"];
    
    for (const type of dataFields) {
      expect(
        fs.existsSync(path.join(process.cwd(), `apps/web/content/docs/fields/data/${type}.mdx`))
      ).toBe(true);
    }
    
    for (const type of layoutFields) {
      expect(
        fs.existsSync(path.join(process.cwd(), `apps/web/content/docs/fields/layout/${type}.mdx`))
      ).toBe(true);
    }
  });

  /**
   * Property 6: Every field reference page contains an auto-type-table
   * 
   * For any .mdx file under fields/data/ or fields/layout/, the file
   * must contain at least one <auto-type-table tag.
   * 
   * Validates: Requirements 14.2, 15.2
   */
  it("Property 6: Every field reference page contains an auto-type-table", () => {
    const fieldFiles = findFiles(path.join(DOCS_ROOT, "fields"), ".mdx");
    
    for (const file of fieldFiles) {
      // Skip meta files and types overview
      if (file.endsWith("meta.json") || file.endsWith("types.mdx")) continue;
      
      const content = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      expect(content).toMatch(/<auto-type-table/);
    }
  });

  /**
   * Property 7: All built-in validators are documented
   * 
   * For any validator name in the ValidatorArgsMap interface,
   * that name must appear in the validation reference page.
   * 
   * Validates: Requirements 5.2
   */
  it("Property 7: All built-in validators are documented", () => {
    const validators = [
      "required", "email", "minLength", "maxLength", "pattern",
      "min", "max", "precision", "step", "minItems", "maxItems",
      "minSelected", "maxSelected", "minDate", "maxDate",
      "minTags", "maxTags", "matches", "passwordCriteria"
    ];
    
    const validationPage = fs.readFileSync(
      path.join(process.cwd(), "apps/web/content/docs/validation.mdx"),
      "utf8"
    );
    
    for (const validator of validators) {
      expect(validationPage).toContain(validator);
    }
  });

  /**
   * Property 8: Every API reference page uses auto-type-table
   * 
   * For any MDX page in the React Adapter section or Core Concepts
   * section that is designated as an API reference page, the file
   * must contain at least one <auto-type-table tag.
   * 
   * Validates: Requirements 18.5
   */
  it("Property 8: Every API reference page uses auto-type-table", () => {
    const apiPages = [
      "use-form",
      "form-component",
      "form-provider",
      "render-fields",
      "field-wrappers",
      "field-hooks",
      "schema",
      "validation",
    ];
    
    for (const page of apiPages) {
      const content = fs.readFileSync(
        path.join(process.cwd(), `apps/web/content/docs/${page}.mdx`),
        "utf8"
      );
      expect(content).toMatch(/<auto-type-table/);
    }
  });
});
