import type { OutputConfig } from "@buildnbuzz/form-core";

import { nodesToFields } from "./schema-builder";
import type { Node } from "./types";

/**
 * Generates a complete Next.js component file from a builder node tree.
 *
 * The output uses `"use client"`, imports `@buildnbuzz/form-core` for the
 * schema, and renders the form via the default `@buildnbuzz/form-react`
 * adapter.
 *
 * @param nodes — flat adjacency list of all nodes
 * @param rootIds — top-level node IDs
 * @param formName — human-readable name used for component generation
 * @param outputConfig — optional output transform configuration
 */
export interface CodeGenerationTemplate {
  /**
   * Function that takes the stringified JSON schema, component name, and optional output prop string,
   * and returns the full component code string.
   */
  (schemaString: string, componentName: string, outputProp: string): string;
}

/**
 * Default React template that generates a Next.js component using Tailwind and Sonner.
 */
export const defaultReactTemplate: CodeGenerationTemplate = (schemaString, componentName, outputProp) => `"use client";

import { defineSchema, type InferType } from "@buildnbuzz/form-react";
import { Form } from "@/components/buzzform/form";
import { toast } from "sonner";

const formSchema = defineSchema(${schemaString});

type FormData = InferType<typeof formSchema.fields>;

export default function ${componentName}() {
  return (
    <div className="container mx-auto min-h-screen flex items-center justify-center">
      <Form
        className="w-full max-w-lg"
        schema={formSchema}${outputProp}
        onSubmit={async (data: FormData) => {
          await new Promise((r) => setTimeout(r, 1000));
          toast("Form submitted!", {
            description: (
              <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-background p-3 text-xs">
                <code>{JSON.stringify(data, null, 2)}</code>
              </pre>
            ),
          });
        }}
        submitLabel="Submit"
      />
    </div>
  );
}
`;

/**
 * Generates external source code from a builder node tree.
 *
 * @param nodes — flat adjacency list of all nodes
 * @param rootIds — top-level node IDs
 * @param formName — human-readable name used for component generation
 * @param outputConfig — optional output transform configuration
 * @param template — optional template generator function (defaults to React template)
 */
export function generateComponentCode(
  nodes: Record<string, Node>,
  rootIds: string[],
  formName: string,
  outputConfig?: OutputConfig,
  template: CodeGenerationTemplate = defaultReactTemplate,
): string {
  const componentName = toComponentName(formName);
  const fields = nodesToFields(nodes, rootIds);
  const schemaString = JSON.stringify(fields, null, 2);

  const outputProp = outputConfig
    ? (() => {
        const props = [`type: "${outputConfig.type}"`];
        if (outputConfig.delimiter && outputConfig.delimiter !== ".") {
          props.push(`delimiter: "${outputConfig.delimiter}"`);
        }
        const inner = props.join(", ");
        return `\n        output={{ ${inner} }}`;
      })()
    : "";

  return template(schemaString, componentName, outputProp);
}

/**
 * Converts a form name to a valid PascalCase React component name.
 *
 * - Strips non-alphanumeric characters.
 * - Capitalises each word.
 * - Prefixes with "Form" if it starts with a digit.
 * - Appends "Form" if it doesn't already end with "Form".
 */
function toComponentName(formName: string): string {
  const normalized = formName
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join("");

  let name = normalized || "GeneratedForm";

  if (/^[0-9]/.test(name)) {
    name = `Form${name}`;
  }

  if (!name.endsWith("Form")) {
    name = `${name}Form`;
  }

  return name;
}
