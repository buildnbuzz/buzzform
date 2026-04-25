import type { ExpressionOperator } from "./types";

export const EXPRESSION_OPERATORS: {
  value: ExpressionOperator;
  label: string;
  requiresValue: boolean;
}[] = [
  { value: "equals", label: "Equals", requiresValue: true },
  { value: "not_equals", label: "Does not equal", requiresValue: true },
  { value: "contains", label: "Contains", requiresValue: true },
  { value: "not_contains", label: "Does not contain", requiresValue: true },
  { value: "greater_than", label: "Is greater than", requiresValue: true },
  { value: "less_than", label: "Is less than", requiresValue: true },
  { value: "is_empty", label: "Is empty", requiresValue: false },
  { value: "is_not_empty", label: "Is not empty", requiresValue: false },
];
