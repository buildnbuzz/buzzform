import type { DataPath, ContextPath, UnknownData, OptionResolverConfig } from "./types";

// ============================================================================
// Expressions & Conditions
// ============================================================================

export type SerializableExpr<T> =
  | Exclude<T, (...args: never[]) => unknown>
  | { $data: DataPath }
  | { $context: ContextPath }
  | { $args: string }
  | { $when: SerializableCondition; $then: SerializableExpr<T>; $else: SerializableExpr<T> }
  | { $fn: string; args?: Record<string, SerializableExpr<unknown>> }
  | { $text: string };

type ComparisonOperators = {
  eq?: SerializableExpr<unknown>;
  neq?: SerializableExpr<unknown>;
  gt?: SerializableExpr<number>;
  gte?: SerializableExpr<number>;
  lt?: SerializableExpr<number>;
  lte?: SerializableExpr<number>;
  contains?: SerializableExpr<string>;
  startsWith?: SerializableExpr<string>;
  endsWith?: SerializableExpr<string>;
  not?: true;
};

export type SerializableDataCondition = { $data: DataPath } & ComparisonOperators;
export type SerializableContextCondition = { $context: ContextPath } & ComparisonOperators;
export type SerializableAtomicCondition = SerializableDataCondition | SerializableContextCondition;

export type SerializableConditionGroup =
  | { $and: SerializableCondition[] }
  | { $or: SerializableCondition[] };

export type SerializableCondition =
  | boolean
  | SerializableAtomicCondition
  | readonly SerializableAtomicCondition[]
  | SerializableConditionGroup;

export type SerializableExprBoolean = SerializableExpr<boolean> | SerializableCondition;
export type SerializableExprString = SerializableExpr<string>;
export type SerializableExprText = SerializableExpr<string>;
export type SerializableExprNumber = SerializableExpr<number>;

// ============================================================================
// Validation
// ============================================================================

export type SerializableValidationCheck = {
  type: string;
  message: SerializableExprText;
  args?: Record<string, unknown>;
};

export interface SerializableValidationGroup {
  checks: SerializableValidationCheck[];
  debounceMs?: number;
}

export interface SerializableValidationConfig {
  onChange?: SerializableValidationGroup;
  onBlur?: SerializableValidationGroup;
  onSubmit?: SerializableValidationGroup;
}

// ============================================================================
// Options
// ============================================================================

export interface SerializableFieldOption<TValue = string> {
  label: SerializableExprText;
  value: TValue;
  disabled?: SerializableExprBoolean;
  ui?: UnknownData;
}

export type SerializableOptionsConfig =
  | Array<SerializableFieldOption<string> | string>
  | OptionResolverConfig;

// ============================================================================
// Base Field
// ============================================================================

export interface SerializableBaseField<TValue = unknown> {
  name: string;
  id?: string;

  label?: SerializableExprText;
  description?: SerializableExprText;
  placeholder?: SerializableExprString;

  required?: SerializableExprBoolean;
  disabled?: SerializableExprBoolean;
  readOnly?: SerializableExprBoolean;
  hidden?: SerializableExprBoolean;
  condition?: SerializableExprBoolean;

  defaultValue?: SerializableExpr<TValue>;

  validate?: SerializableValidationConfig;
  dependencies?: DataPath[];
  autoComplete?: string;

  meta?: UnknownData;
  ui?: UnknownData;
}

// ============================================================================
// Data Fields
// ============================================================================

export interface SerializableTextField extends SerializableBaseField<string> {
  type: "text";
  trim?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface SerializableEmailField extends SerializableBaseField<string> {
  type: "email";
  minLength?: number;
  maxLength?: number;
}

export interface SerializablePasswordCriteria {
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
}

export interface SerializablePasswordField extends SerializableBaseField<string> {
  type: "password";
  minLength?: number;
  maxLength?: number;
  criteria?: SerializablePasswordCriteria;
}

export interface SerializableTextareaField extends SerializableBaseField<string> {
  type: "textarea";
  trim?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface SerializableNumberField extends SerializableBaseField<number> {
  type: "number";
  min?: number;
  max?: number;
  precision?: number;
  step?: number;
}

export interface SerializableSelectField extends SerializableBaseField<string | string[]> {
  type: "select";
  options: SerializableOptionsConfig;
  hasMany?: boolean;
  minSelected?: number;
  maxSelected?: number;
}

export interface SerializableDateField extends SerializableBaseField<string> {
  type: "date";
  withTime?: boolean;
  minDate?: string;
  maxDate?: string;
}

export interface SerializableTagsField extends SerializableBaseField<string[]> {
  type: "tags";
  minTags?: number;
  maxTags?: number;
  maxTagLength?: number;
  allowDuplicates?: boolean;
}

export interface SerializableCheckboxField extends SerializableBaseField<boolean> {
  type: "checkbox";
  hasMany?: false;
  tristate?: false;
}

export interface SerializableTristateCheckboxField extends SerializableBaseField<boolean | null> {
  type: "checkbox";
  hasMany?: false;
  tristate: true;
}

export interface SerializableCheckboxGroupField extends SerializableBaseField<string[]> {
  type: "checkbox";
  hasMany: true;
  options: SerializableOptionsConfig;
  minSelected?: number;
  maxSelected?: number;
}

export interface SerializableSwitchField extends SerializableBaseField<boolean> {
  type: "switch";
}

export interface SerializableRadioField extends SerializableBaseField<string> {
  type: "radio";
  options: SerializableOptionsConfig;
}

export interface SerializableGroupField extends SerializableBaseField<UnknownData> {
  type: "group";
  fields: readonly SerializableField[];
}

export interface SerializableArrayField extends SerializableBaseField<unknown[]> {
  type: "array";
  primitive?: false;
  fields: readonly SerializableField[];
  minItems?: number;
  maxItems?: number;
}

export type SerializablePrimitiveDataField = Exclude<
  SerializableDataField,
  SerializableGroupField | SerializableArrayField | SerializablePrimitiveArrayField
>;

export type SerializablePrimitiveArrayItemField = Omit<SerializablePrimitiveDataField, "name"> & { name?: string };

export interface SerializablePrimitiveArrayField extends SerializableBaseField<unknown[]> {
  type: "array";
  primitive: true;
  fields: readonly [SerializablePrimitiveArrayItemField];
  minItems?: number;
  maxItems?: number;
}

export type SerializableDataField =
  | SerializableTextField
  | SerializableEmailField
  | SerializablePasswordField
  | SerializableTextareaField
  | SerializableNumberField
  | SerializableSelectField
  | SerializableDateField
  | SerializableTagsField
  | SerializableCheckboxField
  | SerializableTristateCheckboxField
  | SerializableCheckboxGroupField
  | SerializableSwitchField
  | SerializableRadioField
  | SerializableGroupField
  | SerializableArrayField
  | SerializablePrimitiveArrayField;

// ============================================================================
// Layout Fields
// ============================================================================

export interface SerializableBaseLayoutField {
  hidden?: SerializableExprBoolean;
  condition?: SerializableExprBoolean;
  meta?: UnknownData;
  ui?: UnknownData;
}

export interface SerializableRowField extends SerializableBaseLayoutField {
  type: "row";
  fields: readonly SerializableField[];
}

export interface SerializableTab {
  name?: string;
  label: SerializableExprText;
  fields: readonly SerializableField[];
  disabled?: SerializableExprBoolean;
}

export interface SerializableTabsField extends SerializableBaseLayoutField {
  type: "tabs";
  tabs: readonly SerializableTab[];
}

export interface SerializableCollapsibleField extends SerializableBaseLayoutField {
  type: "collapsible";
  label: SerializableExprText;
  fields: readonly SerializableField[];
  collapsed?: SerializableExprBoolean;
}

export type SerializableLayoutField =
  | SerializableRowField
  | SerializableTabsField
  | SerializableCollapsibleField;

export type SerializableField = SerializableDataField | SerializableLayoutField;

// ============================================================================
// Root Schema
// ============================================================================

export interface SerializableFormSchema {
  id?: string;
  title?: string;
  description?: string;
  fields: readonly SerializableField[];
  validate?: SerializableValidationConfig;
  meta?: UnknownData;
}

import type { FormSchema } from "./types";

export function isSerializable(schema: FormSchema): schema is SerializableFormSchema {
  let valid = true;
  const walk = (val: unknown) => {
    if (!valid) return;
    if (typeof val === "function") {
      valid = false;
      return;
    }
    if (val !== null && typeof val === "object") {
      if (typeof (val as { $$typeof?: unknown }).$$typeof === "symbol") {
        valid = false;
        return;
      }
      if (Array.isArray(val)) {
        for (const item of val) walk(item);
      } else {
        for (const key in val) {
          if (Object.prototype.hasOwnProperty.call(val, key)) {
            walk((val as Record<string, unknown>)[key]);
          }
        }
      }
    }
  };
  walk(schema);
  return valid;
}

export function toSerializable(schema: FormSchema): SerializableFormSchema {
  const transform = (val: unknown, key?: string): unknown => {
    if (typeof val === "function") {
      if (key === "options") return [];
      return undefined;
    }
    if (val === null || typeof val !== "object") return val;
    
    if (typeof (val as { $$typeof?: unknown }).$$typeof === "symbol") {
      return String(val);
    }

    if (Array.isArray(val)) {
      // Don't pass 'key' to array items to avoid treating functions in arrays as 'options' incorrectly
      return val.map((v) => transform(v));
    }

    const out: Record<string, unknown> = {};
    for (const k in val) {
      if (Object.prototype.hasOwnProperty.call(val, k)) {
        const transformed = transform((val as Record<string, unknown>)[k], k);
        if (transformed !== undefined) {
          out[k] = transformed;
        }
      }
    }
    return out;
  };

  return transform(schema) as SerializableFormSchema;
}

export function serializeSchema(schema: SerializableFormSchema): string {
  const deterministicStringify = (val: unknown): string | undefined => {
    if (val === null) return "null";
    if (typeof val !== "object") return JSON.stringify(val);
    if (Array.isArray(val)) {
      return "[" + val.map((v) => deterministicStringify(v) ?? "null").join(",") + "]";
    }
    const keys = Object.keys(val as Record<string, unknown>).sort();
    let str = "{";
    let first = true;
    for (const k of keys) {
      const v = (val as Record<string, unknown>)[k];
      if (v !== undefined) {
        const vStr = deterministicStringify(v);
        if (vStr !== undefined) {
          if (!first) str += ",";
          str += JSON.stringify(k) + ":" + vStr;
          first = false;
        }
      }
    }
    str += "}";
    return str;
  };

  return deterministicStringify(schema) || "{}";
}

export function deserializeSchema(json: string): SerializableFormSchema {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.fields)) {
      throw new Error("Invalid schema structure: missing 'fields' array");
    }
    return parsed as SerializableFormSchema;
  } catch (err) {
    if (err instanceof Error && err.message !== "Invalid schema structure: missing 'fields' array") {
      throw new Error(`Failed to parse schema: ${err.message}`);
    }
    throw err;
  }
}
