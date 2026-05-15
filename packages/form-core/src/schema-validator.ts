import type { SerializableFormSchema } from "./serializable";

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

  // Scaffolding: full implementation in subsequent tasks.

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
