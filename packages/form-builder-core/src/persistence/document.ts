import type { FormSchema } from "@buildnbuzz/form-core";

import { migrateBuilderDocument } from "./migrations";
import { FormSchemaShapeSchema } from "./schemas";

export class FormSchemaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormSchemaValidationError";
  }
}

/**
 * Parses a JSON string into a `FormSchema` object, migrating legacy
 * builder backup format when needed.
 *
 * @throws {FormSchemaValidationError} When the JSON is invalid or the shape
 *   is not a recognised builder backup or FormSchema.
 */
export function parseFormSchemaJson(json: string): FormSchema {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new FormSchemaValidationError("Invalid JSON document.");
  }

  return normalizeFormSchema(parsed);
}

/**
 * Serialises a `FormSchema` to a JSON string.
 */
export function serializeFormSchema(schema: FormSchema): string {
  return JSON.stringify(schema, null, 2);
}

/**
 * Validates and normalises an arbitrary value into a `FormSchema`.
 *
 * Accepts both legacy builder backup format and modern `FormSchema` shape.
 * The returned object conforms to the `FormSchema` interface but is not
 * type-narrowed at the field level — that validation happens downstream
 * when the fields are consumed by `@buildnbuzz/form-core`.
 */
export function normalizeFormSchema(input: unknown): FormSchema {
  const migrated = migrateBuilderDocument(input);

  return {
    id: migrated.formId || undefined,
    title: migrated.formName || undefined,
    fields: migrated.fields as FormSchema["fields"],
    ...(migrated.outputConfig
      ? { output: migrated.outputConfig }
      : {}),
  } as FormSchema;
}

/**
 * Validates that a value matches the `FormSchema` shape at a high level.
 *
 * Performs a lightweight check: `fields` must be an array, and optional
 * metadata keys must be strings. Does NOT recurse into individual fields.
 *
 * @throws {FormSchemaValidationError} When the shape is invalid.
 */
export function validateFormSchemaShape(input: unknown): void {
  const result = FormSchemaShapeSchema.safeParse(input);
  if (!result.success) {
    const issue = result.error.issues[0];
    if (!issue) throw new FormSchemaValidationError("Shape validation failed.");
    const path = issue.path.map(String).join(".");
    throw new FormSchemaValidationError(
      path ? `${path}: ${issue.message}` : issue.message,
    );
  }
}
