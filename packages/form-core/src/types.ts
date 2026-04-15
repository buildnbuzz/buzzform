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
 * Empty interface for framework adapters to augment globally.
 * @example
 * declare module "@buildnbuzz/form-core" {
 *   interface FrameworkOverrides { react: ReactNode; }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FrameworkOverrides { }

/** Type derived from global augmentations. */
export type FrameworkText = keyof FrameworkOverrides extends never
  ? never
  : FrameworkOverrides[keyof FrameworkOverrides];

// ============================================================================
// Unified Expression System
// ============================================================================

/**
 * Unified runtime context for expression evaluation.
 *
 * Property names mirror the AST node prefixes:
 * - `data`    → resolved by `{ $data: path }` references
 * - `context` → resolved by `{ $context: path }` references
 */
export interface ExprContext {
  /** Form data — resolved by `{ $data: path }` expressions. */
  data: Record<string, unknown>;
  /** External context data — resolved by `{ $context: path }` expressions. */
  context?: Record<string, unknown>;
}

/**
 * Core expression nodes shared by all `Expr<T>` specializations.
 * @internal
 */
type ExprBase<T> =
  | T
  | { $data: DataPath }
  | { $context: ContextPath }
  | { $when: Condition; $then: Expr<T>; $else: Expr<T> }
  | { $fn: string; args?: Record<string, Expr<unknown>> }
  | { $text: string }
  | ((ctx: ExprContext) => T);

/**
 * A unified expression that resolves to `T`.
 *
 * When `T` extends `boolean`, condition predicates (`AtomicCondition`,
 * implicit AND arrays, `$and`/`$or` groups) are also accepted — making
 * `Expr<boolean>` a superset of `Condition`.
 */
export type Expr<T> = boolean extends T
  ? ExprBase<T> | AtomicCondition | readonly AtomicCondition[] | ConditionGroup
  : ExprBase<T>;

/** Convenience alias for `Expr<boolean>`. */
export type ExprBoolean = Expr<boolean>;
/** Convenience alias for `Expr<string>`. */
export type ExprString = Expr<string>;
/** Convenience alias for `Expr<string | FrameworkText>`. */
export type ExprText = Expr<string | FrameworkText>;
/** Convenience alias for `Expr<number>`. */
export type ExprNumber = Expr<number>;

// ============================================================================
// Deprecated DynamicValue aliases — removed.
// Use `Expr<T>` and its convenience aliases instead:
//   DynamicValue<T>  → Expr<T>
//   DynamicString    → ExprString
//   DynamicText      → ExprText
//   DynamicNumber    → ExprNumber
//   DynamicBoolean   → ExprBoolean
// ============================================================================

/** Generic unknown object shape for extension data. */
export type UnknownData = Record<string, unknown>;

// ============================================================================
// 2. VISIBILITY CONDITIONS (AST)
// ============================================================================

/**
 * Comparison operators used in atomic condition nodes.
 */
type ComparisonOperators = {
  eq?: Expr<unknown>;
  neq?: Expr<unknown>;
  gt?: Expr<number>;
  gte?: Expr<number>;
  lt?: Expr<number>;
  lte?: Expr<number>;
  contains?: Expr<string>;
  startsWith?: Expr<string>;
  endsWith?: Expr<string>;
  not?: true;
};

/** A condition evaluated against form data. */
export type DataCondition = { $data: DataPath } & ComparisonOperators;

/** A condition evaluated against external context. */
export type ContextCondition = { $context: ContextPath } & ComparisonOperators;

/** An atomic condition node. */
export type AtomicCondition = DataCondition | ContextCondition;

/** An explicit AND condition group. */
export type AndCondition = { $and: Condition[] };

/** An explicit OR condition group. */
export type OrCondition = { $or: Condition[] };

/** A grouped condition node. */
export type ConditionGroup = AndCondition | OrCondition;

/**
 * Boolean predicate expression — used as the `$when` predicate.
 *
 * @remarks [type]
 * A restricted, serializable subset of `Expr<boolean>`.
 * Does not include `$fn`, `$text`, `$when`, or inline functions.
 */
export type Condition =
  | boolean
  | AtomicCondition
  | readonly AtomicCondition[]
  | ConditionGroup;

/** @deprecated Use `Condition` instead. */
export type VisibilityCondition = Condition;

// ============================================================================
// 3. VALIDATION CONFIG (RUNTIME-FIRST)
// ============================================================================

/** Built-in validator argument map for v0.1. */
export interface ValidatorArgsMap {
  required: Record<string, never>;
  email: Record<string, never>;
  minLength: { min?: number | ExprNumber };
  maxLength: { max?: number | ExprNumber };
  pattern: { pattern?: string };
  min: { min?: number | ExprNumber };
  max: { max?: number | ExprNumber };
  precision: { precision?: number | ExprNumber };
  step: { step?: number | ExprNumber };
  minItems: { min?: number | ExprNumber };
  maxItems: { max?: number | ExprNumber };
  minSelected: { min?: number | ExprNumber };
  maxSelected: { max?: number | ExprNumber };
  minDate: { min?: string };
  maxDate: { max?: string };
  minTags: { min?: number | ExprNumber };
  maxTags: { max?: number | ExprNumber };
  matches: { other?: Expr<unknown> };
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
  label?: ExprText;
  /** Help text shown below the field. */
  description?: ExprText;
  /** Placeholder text. */
  placeholder?: ExprString;

  // --- State ---
  /** Whether the field is required (runtime-only in v0.1). */
  required?: Expr<boolean>;
  /** Disable user interaction; the field still stays in state and validation. */
  disabled?: Expr<boolean>;
  /** Make the field read-only; the value stays visible and still participates in validation. */
  readOnly?: Expr<boolean>;
  /** Hide the field visually; it still stays in state and validation. */
  hidden?: Expr<boolean>;
  /** Unmount the field entirely; it is removed from active state and validation. */
  condition?: Expr<boolean>;

  // --- Data ---
  /** Default value. */
  defaultValue?: Expr<TValue>;

  // --- Validation ---
  /** Declarative validation rules. */
  validate?: ValidationConfig;

  // --- Reactivity ---
  /** Explicit data paths to track for triggering dynamic evaluations and async resolvers. */
  dependencies?: DataPath[];

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
  /** Available options. Supports static arrays, registry resolvers, or inline functions. */
  options: OptionsConfig;
  /** Enable multi-select mode. */
  hasMany?: boolean;
  /** Minimum number of selections (only applies when hasMany is true). */
  minSelected?: number;
  /** Maximum number of selections (only applies when hasMany is true). */
  maxSelected?: number;
}

/** Date input field. Supports optional time picker via `withTime`. */
export interface DateField extends BaseField<string> {
  type: "date";
  /**
   * Include a time picker alongside the date picker.
   * When true, the stored value is a full ISO datetime string.
   * When false or absent, the stored value is an ISO date string (YYYY-MM-DD).
   */
  withTime?: boolean;
  /** ISO date string minimum constraint (YYYY-MM-DD or full ISO datetime). */
  minDate?: string;
  /** ISO date string maximum constraint (YYYY-MM-DD or full ISO datetime). */
  maxDate?: string;
}

/** Tags input field — chip-based multi-value string input. */
export interface TagsField extends BaseField<string[]> {
  type: "tags";
  /** Minimum number of tags. */
  minTags?: number;
  /** Maximum number of tags. */
  maxTags?: number;
  /** Maximum character length per tag. */
  maxTagLength?: number;
  /** Allow duplicate tag values. Defaults to `false`. */
  allowDuplicates?: boolean;
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
  /** Available options. Supports static arrays, registry resolvers, or inline functions. */
  options: OptionsConfig;
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
  /** Available options. Supports static arrays, registry resolvers, or inline functions. */
  options: OptionsConfig;
}

/**
 * Group field - wraps fields in a named object.
 */
export interface GroupField extends BaseField<UnknownData> {
  type: "group";
  /** Nested fields. */
  fields: readonly Field[];
}

/**
 * Standard array field — each item is an object composed from its child fields.
 */
export interface ArrayField extends BaseField<unknown[]> {
  type: "array";
  /** Must be absent or `false` for standard (nested-object) arrays. */
  primitive?: false;
  /** Fields for each array item. */
  fields: readonly Field[];
  /**
   * Minimum number of items. Disables remove at minimum and blocks submit via validation.
   */
  minItems?: number;
  /**
   * Maximum number of items. Disables add at maximum and blocks submit via validation.
   */
  maxItems?: number;
}

/**
 * A data field that holds a single primitive value (excludes containers).
 *
 * @remarks [type]
 * Used to restrict the child field of a primitive array.
 */
export type PrimitiveDataField = Exclude<DataField, GroupField | ArrayField | PrimitiveArrayField>;

/**
 * A primitive data field with an optional `name`.
 *
 * @remarks [type]
 * Used as the child of a `PrimitiveArrayField`. When `name` is omitted or `""`,
 * the item value maps directly into the array element (e.g. `tags: string[]`).
 * Providing a `name` wraps each item in an object (e.g. `socials: { url: string }[]`).
 */
export type PrimitiveArrayItemField = Omit<PrimitiveDataField, "name"> & { name?: string };

/**
 * Primitive array field — each item is a single primitive value.
 *
 * The child field's `name` can be omitted entirely to map the value directly
 * into the array element (e.g. `tags: string[]`).
 */
export interface PrimitiveArrayField extends BaseField<unknown[]> {
  type: "array";
  /** Must be `true` for primitive (flat-value) arrays. */
  primitive: true;
  /** Exactly one primitive data field for each array item. */
  fields: readonly [PrimitiveArrayItemField];
  /**
   * Minimum number of items. Disables remove at minimum and blocks submit via validation.
   */
  minItems?: number;
  /**
   * Maximum number of items. Disables add at maximum and blocks submit via validation.
   */
  maxItems?: number;
}

/**
 * Union of all array field variants.
 *
 * @remarks [type]
 * Discriminated by `primitive` — mirrors the checkbox `hasMany` pattern.
 */
export type ArrayFieldDef = ArrayField | PrimitiveArrayField;

// ============================================================================
// 5.5. OPTIONS & RESOLVERS
// ============================================================================

/** @deprecated Use `ExprContext` instead. Same shape — `data` / `context`. */
export type OptionResolverContext = ExprContext;

/** Function signature for dynamic option resolution. */
export type OptionResolverFn = (
  ctx: ExprContext,
  args?: Record<string, unknown>,
) => Promise<Array<FieldOption | string>> | Array<FieldOption | string>;

/**
 * Serialized registry configuration for option resolution.
 */
export interface OptionResolverConfig {
  /** Key of the resolver in the OptionResolverRegistry. */
  resolver: string;
  /** Optional static arguments passed to the resolver. */
  args?: Record<string, unknown>;
}

/** Registry mapping resolver keys to functions. */
export type OptionResolverRegistry = Record<string, OptionResolverFn>;

// ============================================================================
// Unified Expression Registry
// ============================================================================

/**
 * A registered expression function callable via `{ $fn: "name" }`.
 */
export type ExprFn = (
  ctx: ExprContext & { args?: Record<string, unknown> },
) => unknown;

/** Registry of named functions for `$fn` expression nodes. */
export type FnRegistry = Record<string, ExprFn>;

/**
 * Unified registry container for all named runtime functions.
 *
 * Passed via `FormProvider` (app-wide) or `useForm` (per-form).
 * Per-form registries are shallow-merged over FormProvider registries.
 */
export interface FormRegistries {
  /**
   * Field component registry. Maps field type strings to renderer components.
   * (e.g., `{ text: MyTextInput, select: MySelect }`)
   */
  fields?: Record<string, unknown>;
  /** Custom validators for validation checks with `type: "name"`. */
  validators?: Record<string, (...args: unknown[]) => boolean | Promise<boolean>>;
  /** Async option resolvers for `{ resolver: "name" }` in OptionsConfig. */
  resolvers?: OptionResolverRegistry;
  /** Expression functions for `{ $fn: "name" }` in any Expr position. */
  fns?: FnRegistry;
}

/**
 * Options configuration for a field.
 * Supports static arrays, serialized registry lookups, or inline functions.
 *
 * @remarks [type]
 */
export type OptionsConfig =
  | Array<FieldOption | string>          // static
  | OptionResolverConfig                 // { resolver } — async, resolved by useFieldOptions
  | OptionResolverFn;                    // inline function


/** Option for select and radio fields. */
export interface FieldOption<TValue = string> {
  /** Option label. */
  label: ExprText;
  /** Option value. */
  value: TValue;
  /** Option disabled state. */
  disabled?: Expr<boolean>;
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
  | DateField
  | TagsField
  | CheckboxField
  | TristateCheckboxField
  | CheckboxGroupField
  | SwitchField
  | RadioField
  | GroupField
  | ArrayField
  | PrimitiveArrayField;

// ============================================================================
// 6. LAYOUT FIELDS (v0.1)
// ============================================================================

/** Base layout field shared props. */
export interface BaseLayoutField {
  /** Hide the container visually; child fields still stay active. */
  hidden?: Expr<boolean>;
  /** Unmount the container entirely; child fields are removed from active runtime behavior. */
  condition?: Expr<boolean>;
  /** Custom metadata for extension purposes. */
  meta?: UnknownData;
  /** UI-specific configuration for adapters (opaque to form-core). */
  ui?: UnknownData;
}

/** Row layout - horizontal container. */
export interface RowField extends BaseLayoutField {
  type: "row";
  /** Fields to display in a row. */
  fields: readonly Field[];
}

/** Tab configuration for a tabs layout. */
export interface Tab {
  /** Optional tab name (does not affect data shape in v0.1). */
  name?: string;
  /** Tab label. */
  label: ExprText;
  /** Fields in this tab. */
  fields: readonly Field[];
  /** Whether this tab is disabled. */
  disabled?: Expr<boolean>;
}

/** Tabs layout - tabbed container. */
export interface TabsField extends BaseLayoutField {
  type: "tabs";
  /** Tab definitions. */
  tabs: readonly Tab[];
}

/** Collapsible layout - expandable container. */
export interface CollapsibleField extends BaseLayoutField {
  type: "collapsible";
  /** Collapsible label. */
  label: ExprText;
  /** Nested fields. */
  fields: readonly Field[];
  /** Start collapsed. */
  collapsed?: Expr<boolean>;
}

/** Union of all layout-only fields. */
export type LayoutField = RowField | TabsField | CollapsibleField;

// ============================================================================
// 7. FIELD + FORM SCHEMA
// ============================================================================

/** Union of all supported fields in v0.1. */
export type Field = DataField | LayoutField;

/** Union of all field type string literals. */
export type FieldType = Field["type"];

/**
 * Returns `true` if the given field type can hold child fields.
 *
 * Includes `group` and `array` (data containers) as well as `row`,
 * `tabs`, and `collapsible` (layout containers).
 */
export function isContainerType(type: FieldType): boolean {
  return (
    type === "group" ||
    type === "array" ||
    type === "row" ||
    type === "tabs" ||
    type === "collapsible"
  );
}

/** Root schema container. */
export interface FormSchema {
  /** Optional stable schema identifier. */
  id?: string;
  /** Human-readable schema title. */
  title?: string;
  /** Human-readable schema description. */
  description?: string;
  /** Field list. */
  fields: readonly Field[];
  /** Form-level validation rules. */
  validate?: ValidationConfig;
  /** Optional schema metadata. */
  meta?: UnknownData;
}

/** Type guard to test if a Field is a LayoutField */
export function isLayoutField(field: Field): field is LayoutField {
  return field.type === "row" || field.type === "tabs" || field.type === "collapsible";
}

/** Type guard to test if a Field is a DataField */
export function isDataField(field: Field): field is DataField {
  return !isLayoutField(field);
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

/** Collapse a union into an intersection (`A | B` → `A & B`). */
type UnionToIntersection<T> = (
  T extends unknown ? (arg: T) => void : never
) extends (arg: infer I) => void
  ? I
  : never;

/** Any field that carries a data value (includes primitive array item fields with optional `name`). */
type AnyDataField = DataField | PrimitiveArrayItemField;

/**
 * Maps each data field to its inferred value type.
 *
 * @remarks [type]
 * Single source of truth for field → value resolution.
 * Extend this when adding new field types.
 */
interface FieldValueMap<TField extends AnyDataField> {
  text: string;
  email: string;
  password: string;
  textarea: string;
  number: number;
  select: TField extends SelectField
  ? TField["hasMany"] extends true
  ? string[]
  : string
  : never;
  date: string;
  tags: string[];
  checkbox: TField extends CheckboxGroupField
  ? string[]
  : TField extends TristateCheckboxField
  ? boolean | null
  : boolean;
  switch: boolean;
  radio: string;
  group: TField extends GroupField ? InferType<TField["fields"]> : never;
  array: TField extends PrimitiveArrayField
  ? (TField["fields"][0]["name"] extends "" | undefined
    ? FieldValue<TField["fields"][0]>[]
    : { [K in Extract<TField["fields"][0]["name"], string>]: FieldValue<TField["fields"][0]> }[])
  : TField extends ArrayField
  ? InferType<TField["fields"]>[]
  : never;
}

/** Resolve the inferred value type for a data field. */
type FieldValue<TField extends AnyDataField> =
  TField["type"] extends keyof FieldValueMap<TField>
  ? FieldValueMap<TField>[TField["type"]]
  : never;

/** Resolve the data shape contribution of a single field (data or layout). */
type FieldDataShape<TField extends Field> = TField extends DataField
  ? TField["required"] extends true
  ? { [K in TField["name"]]: FieldValue<TField> }
  : { [K in TField["name"]]?: FieldValue<TField> }
  : TField extends RowField
  ? InferType<TField["fields"]>
  : TField extends TabsField
  ? Simplify<UnionToIntersection<InferType<TField["tabs"][number]["fields"]>>>
  : TField extends CollapsibleField
  ? InferType<TField["fields"]>
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intersection identity
  : {};

/**
 * Infer the data shape for a list of fields.
 *
 * @remarks [type]
 * Fields with `required: true` (literal) produce required keys; all others are optional.
 * Dynamic conditions cannot be resolved at compile time and default to optional.
 */
export type InferType<TFields extends readonly Field[]> =
  TFields extends readonly [infer Head, ...infer Tail]
  ? Simplify<
    FieldDataShape<Extract<Head, Field>> &
    InferType<Tail extends readonly Field[] ? Tail : []>
  >
  : [TFields[number]] extends [never]
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- intersection identity
  ? {}
  : UnknownData;

/**
 * Identity function that narrows a schema to its literal type.
 * Use this instead of `as const satisfies FormSchema` for cleaner DX.
 *
 * @example
 * ```ts
 * const schema = defineSchema({ fields: [{ type: "text", name: "email", required: true }] });
 * type FormData = InferType<typeof schema.fields>;
 * // { email: string }
 * ```
 */
export function defineSchema<const T extends FormSchema>(schema: T): T {
  return schema;
}
