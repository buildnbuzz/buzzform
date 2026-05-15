import type { FieldType, BuiltInValidatorName } from "./types";

export type FieldCategory = "input" | "choice" | "container" | "layout";

export interface FieldTypeMeta {
  /** The field type identifier */
  type: FieldType;
  /** Broad category for UI grouping */
  category: FieldCategory;
  /** Human readable description of what the field is for */
  description: string;
  /** Properties that are always required when defining this field */
  requiredProps: readonly string[];
  /** Optional properties supported by this field */
  optionalProps: readonly string[];
  /** Supported built-in validators */
  applicableValidators: readonly BuiltInValidatorName[];
  /** Example of a minimal valid configuration */
  example: Record<string, unknown>;
}

export const FIELD_TYPE_META: Record<FieldType, FieldTypeMeta> = {} as Record<FieldType, FieldTypeMeta>;

export function getFieldMeta(type: string): FieldTypeMeta | undefined {
  return FIELD_TYPE_META[type as FieldType];
}

export function getFieldsByCategory(category: FieldCategory): FieldTypeMeta[] {
  return Object.values(FIELD_TYPE_META).filter((meta) => meta && meta.category === category);
}
