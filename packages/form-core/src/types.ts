// =============================================================================
// form-core types (minimal, runtime-first)
// =============================================================================

// ============================================================================
// 1. DATA PATHS + DYNAMIC VALUES
// ============================================================================

/**
 * A string path into form data.
 *
 * @remarks [type]
 * Keep this intentionally simple for v0.1 to avoid heavy type recursion.
 */
export type DataPath = string;

/**
 * A string path into external context data.
 *
 * @remarks [type]
 * Context paths are used by adapters for conditional logic and dynamic values.
 */
export type ContextPath = string;

/**
 * A literal value or a dynamic reference to form data or external context.
 */
export type DynamicValue<T = unknown> =
  | T
  | { $data: DataPath }
  | { $context: ContextPath };

/** A dynamic string value. */
export type DynamicString = DynamicValue<string>;

/** A dynamic number value. */
export type DynamicNumber = DynamicValue<number>;

/** A dynamic boolean value. */
export type DynamicBoolean = DynamicValue<boolean>;

/** Generic unknown object shape for extension data. */
export type UnknownData = Record<string, unknown>;

// ============================================================================
// 2. VISIBILITY CONDITIONS (AST)
// ============================================================================

type ComparisonOperators = {
  eq?: DynamicValue<unknown>;
  neq?: DynamicValue<unknown>;
  gt?: DynamicValue<number>;
  gte?: DynamicValue<number>;
  lt?: DynamicValue<number>;
  lte?: DynamicValue<number>;
  contains?: DynamicValue<string>;
  startsWith?: DynamicValue<string>;
  endsWith?: DynamicValue<string>;
  not?: true;
};

/** A condition evaluated against form data. */
export type DataCondition = { $data: DataPath } & ComparisonOperators;

/** A condition evaluated against external context. */
export type ContextCondition = { $context: ContextPath } & ComparisonOperators;

/** An atomic condition node. */
export type AtomicCondition = DataCondition | ContextCondition;

/** An explicit AND condition group. */
export type AndCondition = { $and: VisibilityCondition[] };

/** An explicit OR condition group. */
export type OrCondition = { $or: VisibilityCondition[] };

/** A grouped condition node. */
export type ConditionGroup = AndCondition | OrCondition;

/**
 * A visibility condition AST.
 *
 * @remarks [type]
 * Arrays are treated as implicit AND.
 */
export type VisibilityCondition =
  | boolean
  | AtomicCondition
  | readonly AtomicCondition[]
  | ConditionGroup;

// ============================================================================
// 3. VALIDATION CONFIG (RUNTIME-FIRST)
// ============================================================================

/** Built-in validator argument map for v0.1. */
export interface ValidatorArgsMap {
  required: Record<string, never>;
  email: Record<string, never>;
  minLength: { min?: number | DynamicNumber };
  maxLength: { max?: number | DynamicNumber };
  pattern: { pattern?: string };
  min: { min?: number | DynamicNumber };
  max: { max?: number | DynamicNumber };
  precision: { precision?: number | DynamicNumber };
  step: { step?: number | DynamicNumber };
  minItems: { min?: number | DynamicNumber };
  maxItems: { max?: number | DynamicNumber };
  minSelected: { min?: number | DynamicNumber };
  maxSelected: { max?: number | DynamicNumber };
  matches: { other?: DynamicValue<unknown> };
  passwordCriteria: {
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  };
}

/** Names of built-in validators. */
export type BuiltInValidatorName = keyof ValidatorArgsMap;

/** A built-in validation check. */
export type BuiltInValidationCheck = {
  [Key in BuiltInValidatorName]: {
    /** Validator identifier. */
    type: Key;
    /** Error message shown when the check fails. */
    message: string;
    /** Optional arguments for the validator. */
    args?: ValidatorArgsMap[Key];
  };
}[BuiltInValidatorName];

/** A custom validation check. */
export type CustomValidationCheck = {
  /** Custom validator identifier. */
  type: Exclude<string, BuiltInValidatorName>;
  /** Error message shown when the check fails. */
  message: string;
  /** Extra arguments passed to the validator. */
  args?: UnknownData;
};

/** A validation check (built-in or custom). */
export type ValidationCheck = BuiltInValidationCheck | CustomValidationCheck;

/**
 * Validation checks grouped by a trigger.
 */
export interface ValidationGroup {
  /** Validation checks for a given trigger. */
  checks: ValidationCheck[];
  /** Debounce delay in ms (useful for async checks). */
  debounceMs?: number;
}

/**
 * Validation configuration for a field.
 */
export interface ValidationConfig {
  /** Runs on value change. */
  onChange?: ValidationGroup;
  /** Runs on blur. */
  onBlur?: ValidationGroup;
  /** Runs on submit. */
  onSubmit?: ValidationGroup;
}

// ============================================================================
// 4. FIELD BASICS
// ============================================================================

/**
 * Base field interface. All data fields extend this.
 */
export interface BaseField<TValue = unknown> {
  /** Field name - becomes the key in form data. */
  name: string;
  /** Explicit HTML id override (defaults to path-based generation). */
  id?: string;

  // --- Display ---
  /** Display label. */
  label?: DynamicString;
  /** Help text shown below the field. */
  description?: DynamicString;
  /** Placeholder text. */
  placeholder?: DynamicString;

  // --- State ---
  /** Whether the field is required (runtime-only in v0.1). */
  required?: VisibilityCondition;
  /** Disable user interaction; the field still stays in state and validation. */
  disabled?: VisibilityCondition;
  /** Make the field read-only; the value stays visible and still participates in validation. */
  readOnly?: VisibilityCondition;
  /** Hide the field visually; it still stays in state and validation. */
  hidden?: VisibilityCondition;
  /** Unmount the field entirely; it is removed from active state and validation. */
  condition?: VisibilityCondition;

  // --- Data ---
  /** Default value. */
  defaultValue?: DynamicValue<TValue>;

  // --- Validation ---
  /** Declarative validation rules. */
  validate?: ValidationConfig;

  // --- HTML ---
  /** HTML autocomplete attribute. */
  autoComplete?: string;

  // --- Extension ---
  /** Custom metadata for extension purposes. */
  meta?: UnknownData;
  /** UI-specific configuration for adapters (opaque to form-core). */
  ui?: UnknownData;
}

// ============================================================================
// 5. DATA FIELDS (v0.1)
// ============================================================================

/** Text input field. */
export interface TextField extends BaseField<string> {
  type: "text";
  /** Trim whitespace from the value on blur. */
  trim?: boolean;
  /** Minimum character length. */
  minLength?: number;
  /** Maximum character length. */
  maxLength?: number;
  /** Regex pattern the value must match. */
  pattern?: string;
}

/** Email input field. Automatically applies email format validation. */
export interface EmailField extends BaseField<string> {
  type: "email";
  /** Minimum character length. */
  minLength?: number;
  /** Maximum character length. */
  maxLength?: number;
}

/** Password strength criteria. */
export interface PasswordCriteria {
  /** Require at least one uppercase letter. */
  requireUppercase?: boolean;
  /** Require at least one lowercase letter. */
  requireLowercase?: boolean;
  /** Require at least one numeric digit. */
  requireNumber?: boolean;
  /** Require at least one special character. */
  requireSpecial?: boolean;
}

/** Password input field. */
export interface PasswordField extends BaseField<string> {
  type: "password";
  /** Minimum character length. Defaults to 8. */
  minLength?: number;
  /** Maximum character length. */
  maxLength?: number;
  /** Password strength criteria for validation. */
  criteria?: PasswordCriteria;
}

/** Multi-line text input field. */
export interface TextareaField extends BaseField<string> {
  type: "textarea";
  /** Trim whitespace from the value on blur. */
  trim?: boolean;
  /** Minimum character length. */
  minLength?: number;
  /** Maximum character length. */
  maxLength?: number;
  /** Regex pattern the value must match. */
  pattern?: string;
}

/** Numeric input field. */
export interface NumberField extends BaseField<number> {
  type: "number";
  /** Minimum numeric value. */
  min?: number;
  /** Maximum numeric value. */
  max?: number;
  /** Maximum allowed decimal precision. */
  precision?: number;
  /** Required multiple for numeric values. */
  step?: number;
}

/** Select input field. */
export interface SelectField extends BaseField<string | string[]> {
  type: "select";
  /** Available options. Strings are normalized to `{ label, value }` at render time. */
  options: FieldOption<string>[] | string[];
  /** Enable multi-select mode. */
  hasMany?: boolean;
  /** Minimum number of selections (only applies when hasMany is true). */
  minSelected?: number;
  /** Maximum number of selections (only applies when hasMany is true). */
  maxSelected?: number;
}

/** Checkbox input field (single boolean). */
export interface CheckboxField extends BaseField<boolean> {
  type: "checkbox";
  hasMany?: false;
  tristate?: false;
}

/**
 * Tri-state checkbox field — value is `true` (yes), `false` (no), or `null` (not sure/unknown).
 * Useful when the distinction between "explicitly no" and "not yet answered" matters.
 * Value cycles on click: null → true → false → null.
 */
export interface TristateCheckboxField extends BaseField<boolean | null> {
  type: "checkbox";
  hasMany?: false;
  /** Enable tri-state mode. Value cycles: null (not sure) → true (yes) → false (no) → null. */
  tristate: true;
}

/** Checkbox group field - multiple selections from a list of options. */
export interface CheckboxGroupField extends BaseField<string[]> {
  type: "checkbox";
  /** Enable multi-select mode; renders a group of checkboxes from options. */
  hasMany: true;
  /** Available options. Strings are normalized to `{ label, value }` at render time. */
  options: FieldOption<string>[] | string[];
  /** Minimum number of selections. */
  minSelected?: number;
  /** Maximum number of selections. */
  maxSelected?: number;
}

/** Switch input field. */
export interface SwitchField extends BaseField<boolean> {
  type: "switch";
}

/** Radio input field. */
export interface RadioField extends BaseField<string> {
  type: "radio";
  /** Available options. Strings are normalized to `{ label, value }` at render time. */
  options: FieldOption<string>[] | string[];
}

/**
 * Group field - wraps fields in a named object.
 */
export interface GroupField extends BaseField<UnknownData> {
  type: "group";
  /** Nested fields. */
  fields: Field[];
}

/**
 * Array field - repeatable fields.
 */
export interface ArrayField extends BaseField<unknown[]> {
  type: "array";
  /** Fields for each array item. */
  fields: Field[];
  /** Minimum items. */
  minRows?: number;
  /** Maximum items. */
  maxRows?: number;
  /** Minimum item count (validation). */
  minItems?: number;
  /** Maximum item count (validation). */
  maxItems?: number;
}

/** Option for select and radio fields. */
export interface FieldOption<TValue = string> {
  /** Option label. */
  label: DynamicString;
  /** Option value. */
  value: TValue;
  /** Option disabled state. */
  disabled?: DynamicBoolean;
  /** UI-specific configuration for this option (e.g., description, icon). */
  ui?: UnknownData;
}

/** Union of all data-bearing fields. */
export type DataField =
  | TextField
  | EmailField
  | PasswordField
  | TextareaField
  | NumberField
  | SelectField
  | CheckboxField
  | TristateCheckboxField
  | CheckboxGroupField
  | SwitchField
  | RadioField
  | GroupField
  | ArrayField;

// ============================================================================
// 6. LAYOUT FIELDS (v0.1)
// ============================================================================

/** Base layout field shared props. */
export interface BaseLayoutField {
  /** Hide the container visually; child fields still stay active. */
  hidden?: VisibilityCondition;
  /** Unmount the container entirely; child fields are removed from active runtime behavior. */
  condition?: VisibilityCondition;
  /** Custom metadata for extension purposes. */
  meta?: UnknownData;
  /** UI-specific configuration for adapters (opaque to form-core). */
  ui?: UnknownData;
}

/** Row layout - horizontal container. */
export interface RowField extends BaseLayoutField {
  type: "row";
  /** Fields to display in a row. */
  fields: Field[];
}

/** Tab configuration for a tabs layout. */
export interface Tab {
  /** Optional tab name (does not affect data shape in v0.1). */
  name?: string;
  /** Tab label. */
  label: DynamicString;
  /** Fields in this tab. */
  fields: Field[];
  /** Whether this tab is disabled. */
  disabled?: DynamicBoolean;
}

/** Tabs layout - tabbed container. */
export interface TabsField extends BaseLayoutField {
  type: "tabs";
  /** Tab definitions. */
  tabs: Tab[];
}

/** Collapsible layout - expandable container. */
export interface CollapsibleField extends BaseLayoutField {
  type: "collapsible";
  /** Collapsible label. */
  label: DynamicString;
  /** Nested fields. */
  fields: Field[];
  /** Start collapsed. */
  collapsed?: DynamicBoolean;
}

/** Union of all layout-only fields. */
export type LayoutField = RowField | TabsField | CollapsibleField;

// ============================================================================
// 7. FIELD + FORM SCHEMA
// ============================================================================

/** Union of all supported fields in v0.1. */
export type Field = DataField | LayoutField;

/** Root schema container. */
export interface FormSchema {
  /** Optional stable schema identifier. */
  id?: string;
  /** Human-readable schema title. */
  title?: string;
  /** Human-readable schema description. */
  description?: string;
  /** Field list. */
  fields: Field[];
  /** Form-level validation rules. */
  validate?: ValidationConfig;
  /** Optional schema metadata. */
  meta?: UnknownData;
}

// ============================================================================
// 8. OUTPUT TRANSFORMATION
// ============================================================================

/** Output format for transformed submission data. */
export type OutputType = "path";

/** Configuration for form output transformation helpers. */
export interface OutputConfig {
  /** Transform nested objects into path-keyed output. */
  type: OutputType;
  /** Delimiter used when flattening nested keys. Defaults to `"."`. */
  delimiter?: string;
}

// ============================================================================
// 9. INFERENCE (SIMPLE, REQUIREDNESS-IGNORING)
// ============================================================================

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type FieldValue<TField extends Field> = TField extends TextField
  ? string
  : TField extends EmailField
    ? string
    : TField extends PasswordField
      ? string
      : TField extends TextareaField
        ? string
        : TField extends NumberField
          ? number
          : TField extends SelectField
            ? TField["hasMany"] extends true
              ? string[]
              : string
            : TField extends CheckboxGroupField
              ? string[]
              : TField extends TristateCheckboxField
                ? boolean | null
                : TField extends CheckboxField
                  ? boolean
                : TField extends SwitchField
                  ? boolean
                  : TField extends RadioField
                    ? string
                    : TField extends GroupField
                      ? InferDataShape<TField["fields"]>
                      : TField extends ArrayField
                        ? InferDataShape<TField["fields"]>[]
                        : never;

type FieldDataShape<TField extends Field> = TField extends DataField
  ? { [K in TField["name"]]: FieldValue<TField> }
  : TField extends RowField
    ? InferDataShape<TField["fields"]>
    : TField extends TabsField
      ? InferDataShape<TField["tabs"][number]["fields"]>
      : TField extends CollapsibleField
        ? InferDataShape<TField["fields"]>
        : Record<string, never>;

/**
 * Infer the data shape for a list of fields.
 *
 * @remarks [type]
 * Requiredness is intentionally ignored in v0.1 for compiler performance.
 */
export type InferDataShape<TFields extends readonly Field[]> =
  TFields extends readonly [infer Head, ...infer Tail]
    ? Simplify<
        FieldDataShape<Extract<Head, Field>> &
          InferDataShape<Tail extends readonly Field[] ? Tail : []>
      >
    : Record<string, never>;
