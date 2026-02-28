import { nodesToFields } from "./schema-builder";
import type { Node } from "./types";
import type { OutputConfig } from "@buildnbuzz/buzzform";

export function generateComponentCode(
  nodes: Record<string, Node>,
  rootIds: string[],
  formName: string,
  outputConfig?: OutputConfig,
) {
  const componentName = toComponentName(formName);
  // 1. Get the raw field structure
  const fields = nodesToFields(nodes, rootIds);

  // 2. Serialize fields to JSON string, but we just stringify the whole array
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

  // 3. Inject into template
  return `"use client";

import { createSchema, InferType } from "@buildnbuzz/buzzform";
import { toast } from "sonner";
import { Form } from "@/components/buzzform/form";

const formSchema = createSchema(${schemaString});

type FormData = InferType<typeof formSchema>;

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
}`;
}

function toComponentName(formName: string) {
  const normalized = formName
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
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
