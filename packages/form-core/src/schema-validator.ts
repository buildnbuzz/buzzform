import type { SerializableFormSchema, SerializableField } from "./serializable";
import { getFieldMeta } from "./field-meta";

export type SchemaIssueSeverity = "error" | "warning";

export type SchemaIssueCode =
  // Field identity
  | "missing_name"
  | "duplicate_name"
  // Structure
  | "missing_options"
  | "missing_fields"
  | "empty_tabs"
  | "primitive_array_multi"
  // Type
  | "invalid_field_type"
  | "name_in_layout"
  // Expression
  | "invalid_condition"
  | "invalid_validation"
  | "orphaned_resolver";

export interface SchemaIssue {
  code: SchemaIssueCode;
  severity: SchemaIssueSeverity;
  /** Dot-separated path to the field or property */
  path: string;
  message: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  issues: SchemaIssue[];
}

/**
 * Validates a SerializableFormSchema for structural and semantic correctness.
 */
export function validateSchema(schema: SerializableFormSchema): SchemaValidationResult {
  const issues: SchemaIssue[] = [];

  function validateFields(fields: readonly SerializableField[], pathPrefix: string, isPrimitiveItem = false) {
    if (!Array.isArray(fields)) return;
    const seenNames = new Set<string>();

    fields.forEach((field, index) => {
      if (!field || typeof field !== "object") return;
      
      const path = pathPrefix ? `${pathPrefix}[${index}]` : `fields[${index}]`;
      const isLayout = ["row", "tabs", "collapsible"].includes(field.type);

      const meta = getFieldMeta(field.type);
      if (!meta) {
        issues.push({
          code: "invalid_field_type",
          severity: "error",
          path,
          message: `Unrecognized field type '${field.type}'.`
        });
      }

      if (isLayout && "name" in field && (field as { name?: unknown }).name !== undefined) {
        issues.push({
          code: "name_in_layout",
          severity: "error",
          path,
          message: `Layout field of type '${field.type}' must not have a 'name' property.`
        });
      }

      if (!isLayout) {
        const name = (field as { name?: unknown }).name;
        if (!isPrimitiveItem && (!name || typeof name !== "string" || name.trim() === "")) {
          issues.push({
            code: "missing_name",
            severity: "error",
            path,
            message: `Data field of type '${field.type}' must have a non-empty name.`
          });
        } else if (name && typeof name === "string") {
          if (seenNames.has(name)) {
            issues.push({
              code: "duplicate_name",
              severity: "error",
              path,
              message: `Duplicate field name '${name}' at same nesting level.`
            });
          }
          seenNames.add(name);
        }
      }

      const structField = field as { options?: unknown; hasMany?: unknown; fields?: unknown; primitive?: unknown; tabs?: unknown };

      if (["select", "radio"].includes(field.type) || (field.type === "checkbox" && structField.hasMany)) {
        if (!Array.isArray(structField.options) || structField.options.length === 0) {
          issues.push({
            code: "missing_options",
            severity: "error",
            path,
            message: `Field of type '${field.type}' must have an 'options' array with at least one item.`
          });
        }
      }

      if (["group", "row", "array", "collapsible"].includes(field.type)) {
        if (!Array.isArray(structField.fields)) {
          issues.push({
            code: "missing_fields",
            severity: "error",
            path,
            message: `Container field of type '${field.type}' must have a 'fields' array.`
          });
        } else if (field.type === "array" && structField.primitive && structField.fields.length !== 1) {
          issues.push({
            code: "primitive_array_multi",
            severity: "error",
            path,
            message: `Primitive array must have exactly one item in its 'fields' array.`
          });
        }
      }

      if (field.type === "tabs") {
        if (!Array.isArray(structField.tabs) || structField.tabs.length === 0) {
          issues.push({
            code: "empty_tabs",
            severity: "error",
            path,
            message: `Tabs field must have a 'tabs' array with at least one item.`
          });
        } else {
          structField.tabs.forEach((tab: { fields?: unknown }, tIndex: number) => {
            if (!tab || typeof tab !== "object" || !Array.isArray(tab.fields)) {
              issues.push({
                code: "missing_fields",
                severity: "error",
                path: `${path}.tabs[${tIndex}]`,
                message: `Tab item must have a 'fields' array.`
              });
            }
          });
        }
      }

      const containerField = field as { fields?: unknown; primitive?: unknown; tabs?: unknown };

      if ("fields" in field && Array.isArray(containerField.fields)) {
        if (field.type === "array" && containerField.primitive) {
          validateFields(containerField.fields as readonly SerializableField[], `${path}.fields`, true);
        } else {
          validateFields(containerField.fields as readonly SerializableField[], `${path}.fields`, false);
        }
      }

      if (field.type === "tabs" && "tabs" in field && Array.isArray(containerField.tabs)) {
        containerField.tabs.forEach((tab: { fields?: unknown }, tIndex: number) => {
          validateFields((tab.fields as readonly SerializableField[]) || [], `${path}.tabs[${tIndex}].fields`, false);
        });
      }
    });
  }

  validateFields(schema.fields, "");

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    issues,
  };
}

/**
 * Formats a list of schema issues into human-readable strings.
 */
export function formatSchemaIssues(issues: SchemaIssue[]): string[] {
  return issues.map((issue) => {
    const prefix = issue.severity === "error" ? "❌ Error" : "⚠️ Warning";
    return `${prefix} [${issue.code}] at ${issue.path || "root"}: ${issue.message}`;
  });
}
