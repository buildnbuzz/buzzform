import type { FormSchema } from "@buildnbuzz/form-core";
import { detectSchemaFormat } from "./detect";
import { migrateLegacyField } from "./migrate-legacy";

export * from "./detect";
export * from "./migrate-legacy";

export function migrateLegacySchema(input: unknown): { schema: FormSchema; warnings: string[] } {
  let schemaRecord: Record<string, unknown>;

  if (Array.isArray(input)) {
    schemaRecord = { fields: input };
  } else if (input && typeof input === "object") {
    schemaRecord = { ...(input as Record<string, unknown>) };
  } else {
    return { schema: { fields: [] }, warnings: [] };
  }

  const format = detectSchemaFormat(schemaRecord);

  if (format === "unknown") {
    // If it's an object with fields but we can't tell, assume form-core
    if (Array.isArray(schemaRecord.fields)) {
      return { schema: schemaRecord as unknown as FormSchema, warnings: [] };
    }
    throw new Error("Invalid schema format: unable to determine if form-core or buzzform-legacy.");
  }

  if (format === "form-core") {
    return { schema: schemaRecord as unknown as FormSchema, warnings: [] };
  }

  const warnings: string[] = [];
  const fields = Array.isArray(schemaRecord.fields) ? schemaRecord.fields : [];
  const migratedFields: unknown[] = [];

  for (const field of fields) {
    const result = migrateLegacyField(field);
    migratedFields.push(result.field);
    warnings.push(...result.warnings);
  }

  const migratedSchema: Record<string, unknown> = {
    ...schemaRecord,
    fields: migratedFields,
  };

  return { schema: migratedSchema as unknown as FormSchema, warnings };
}
