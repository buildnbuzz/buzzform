import type { ExpressionOperator } from "./types";

/** Field type category for operator filtering. */
export type FieldTypeCategory = "text" | "number" | "boolean" | "any";

/**
 * Resolves a form field type string to a broad category for operator filtering.
 */
export function getFieldTypeCategory(fieldType?: string): FieldTypeCategory {
  if (!fieldType) return "any";
  switch (fieldType) {
    case "checkbox":
    case "switch":
      return "boolean";
    case "number":
      return "number";
    case "text":
    case "email":
    case "password":
    case "textarea":
    case "tags":
      return "text";
    default:
      return "any";
  }
}

export const EXPRESSION_OPERATORS: {
  value: ExpressionOperator;
  label: string;
  requiresValue: boolean;
  /** Field type categories this operator applies to. Undefined = all. */
  categories?: FieldTypeCategory[];
}[] = [
  { value: "equals", label: "Equals", requiresValue: true },
  { value: "not_equals", label: "Does not equal", requiresValue: true },
  { value: "contains", label: "Contains", requiresValue: true, categories: ["text", "any"] },
  { value: "not_contains", label: "Does not contain", requiresValue: true, categories: ["text", "any"] },
  { value: "greater_than", label: "Is greater than", requiresValue: true, categories: ["number", "any"] },
  { value: "less_than", label: "Is less than", requiresValue: true, categories: ["number", "any"] },
  { value: "is_empty", label: "Is empty", requiresValue: false, categories: ["text", "number", "any"] },
  { value: "is_not_empty", label: "Is not empty", requiresValue: false, categories: ["text", "number", "any"] },
];

/**
 * Returns operators applicable to a given field type category.
 */
export function getOperatorsForFieldType(fieldType?: string) {
  const category = getFieldTypeCategory(fieldType);
  if (category === "any") return EXPRESSION_OPERATORS;
  return EXPRESSION_OPERATORS.filter(
    (op) => !op.categories || op.categories.includes(category),
  );
}
