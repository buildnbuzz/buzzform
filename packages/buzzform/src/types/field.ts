import type { ReactNode, ComponentType } from "react";
import type { ZodSchema } from "zod";
import type { FormAdapter } from "./adapter";

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Context passed to custom validation functions.
 *
 * @example
 * validate: (value, { data }) => {
 *   if (value !== data.password) return "Passwords do not match";
 *   return true;
 * }
 */
export interface ValidationContext<TData = Record<string, unknown>> {
  /** Complete form data */
  data: TData;
  /** Parent object containing this field and its siblings */
  siblingData: Record<string, unknown>;
  /** Path segments to this field */
  path: string[];
}

/**
 * Validation function return type.
 * - `true` = valid
 * - `string` = error message
 */
export type ValidationResult = true | string | Promise<true | string>;

/**
 * Custom validation function.
 */
export type ValidationFn<TValue = unknown, TData = Record<string, unknown>> = (
  value: TValue,
  context: ValidationContext<TData>,
) => ValidationResult;

// =============================================================================
// CONDITIONAL DISPLAY
// =============================================================================

/**
 * Context for conditional field display.
 */
export interface ConditionContext {
  /** Current operation */
  operation: "create" | "update" | "read";
  /** Path segments to this field */
  path: string[];
}

/**
 * Condition function to control field visibility.
 */
export type FieldCondition<TData = Record<string, unknown>> = (
  data: TData,
  siblingData: Record<string, unknown>,
  context: ConditionContext,
) => boolean;

// =============================================================================
// CUSTOM RENDERING
// =============================================================================

/**
 * Props passed to a full custom field component.
 * Use this when you want complete control over the field rendering.
 */
export interface FieldComponentProps<TValue = unknown, TField = Field> {
  /** The field configuration */
  field: TField;
  /** Field path (e.g., "email", "address.city") */
  path: string;
  /** Generated HTML id for the field input */
  id: string;
  /** Form adapter instance */
  form: FormAdapter;
  /** Current field value */
  value: TValue;
  /** Update the field value */
  onChange: (value: TValue) => void;
  /** Mark field as touched */
  onBlur: () => void;
  /** Whether the field is disabled */
  disabled: boolean;
  /** Whether the field is read-only */
  readOnly: boolean;
  /** First error message, if any */
  error?: string;
  /** Whether the field should auto-focus */
  autoFocus?: boolean;
}

/**
 * Props passed to a custom input component.
 * Use this when you only want to customize the input, keeping the standard wrapper.
 */
export interface FieldInputProps<TValue = unknown, TField = Field> {
  /** The field configuration (access min, max, placeholder, etc.) */
  field: TField;
  /** Field path (e.g., "email", "address.city") */
  path: string;
  /** Generated HTML id (must be used for label association) */
  id: string;
  /** Field name for HTML form/autofill (e.g., "email", "password") */
  name: string;
  /** Current field value */
  value: TValue;
  /** Update the field value */
  onChange: (value: TValue) => void;
  /** Mark field as touched */
  onBlur: () => void;
  /** Whether the field is disabled */
  disabled: boolean;
  /** Whether the field is read-only */
  readOnly: boolean;
  /** First error message, if any */
  error?: string;
  /** Whether the field should auto-focus */
  autoFocus?: boolean;
  /** Live validation state (if enabled) */
  validation?: {
    /** Whether validation is currently running */
    isChecking: boolean;
    /** Whether the field passes validation */
    isValid: boolean;
    /** Validation message */
    message?: string;
  };
}

/**
 * Custom input render function.
 */
export type FieldInputRenderFn<TValue = unknown, TField = Field> = (
  props: FieldInputProps<TValue, TField>,
) => ReactNode;

// =============================================================================
// STYLING
// =============================================================================

/**
 * Styling options for a field.
 */
export interface FieldStyle {
  /** Additional CSS class for the field wrapper */
  className?: string;
  /** Field width (e.g., '50%', '200px', 200) */
  width?: string | number;
}

// =============================================================================
// BASE FIELD
// =============================================================================

/**
 * Base field interface. All field types extend this.
 */
export interface BaseField<TValue = unknown, TData = Record<string, unknown>> {
  // === Identity ===

  /** Field name - becomes the key in form data */
  name: string;

  /** Explicit HTML id override (defaults to path-based generation) */
  id?: string;

  // === Display ===

  /** Display label (false to hide, ReactNode for custom) */
  label?: string | ReactNode | false;

  /** Help text shown below the field */
  description?: string | ReactNode;

  /** Placeholder text */
  placeholder?: string;

  // === State ===

  /** Whether the field is required */
  required?: boolean;

  /**
   * Disable user interaction.
   * Can be a boolean or a function for conditional disabling.
   * @example disabled: (data) => !data.country // Disable until country is selected
   */
  disabled?:
    | boolean
    | ((data: TData, siblingData: Record<string, unknown>) => boolean);

  /** Hide the field from the form UI (static or conditional) */
  hidden?:
    | boolean
    | ((data: TData, siblingData: Record<string, unknown>) => boolean);

  /**
   * Make field read-only.
   * Can be a boolean or a function for conditional read-only state.
   * @example readOnly: (data) => data.status === 'published'
   */
  readOnly?:
    | boolean
    | ((data: TData, siblingData: Record<string, unknown>) => boolean);

  // === Data ===

  /** Default value (static only, async handled at form level) */
  defaultValue?: TValue;

  // === Validation ===

  /** Direct Zod schema (overrides auto-generated) */
  schema?: ZodSchema<TValue>;

  /** Custom validation function */
  validate?: ValidationFn<TValue, TData>;

  // === Conditional Display ===

  /** Condition function to show/hide the field */
  condition?: FieldCondition<TData>;

  // === Styling ===

  /** Styling options */
  style?: FieldStyle;

  // === Custom Rendering ===

  /** Full custom component (replaces entire field) */
  component?: ComponentType<FieldComponentProps<TValue>>;

  /** Custom input only (library handles wrapper/label/error) */
  input?: ComponentType<FieldInputProps<TValue>> | FieldInputRenderFn<TValue>;

  // === HTML Attributes ===

  /** HTML autocomplete attribute */
  autoComplete?: string;

  // === Extension Point ===

  /** Custom metadata */
  meta?: Record<string, unknown>;
}

// =============================================================================
// DATA FIELDS
// =============================================================================

/**
 * Text field
 */
export interface TextField extends BaseField<string> {
  type: "text";
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
  /** Pattern to match (string or RegExp) */
  pattern?: string | RegExp;
  /** Trim whitespace */
  trim?: boolean;
  /** UI options */
  ui?: {
    /** Show copy button to copy value to clipboard */
    copyable?: boolean;
  };
}

/**
 * Email field
 */
export interface EmailField extends BaseField<string> {
  type: "email";
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
  /** Pattern to match (string or RegExp) */
  pattern?: string | RegExp;
  /** Trim whitespace */
  trim?: boolean;
  /** UI options */
  ui?: {
    /** Show copy button to copy value to clipboard */
    copyable?: boolean;
  };
}

/**
 * Password field
 */
export interface PasswordField extends BaseField<string> {
  type: "password";
  /** Minimum length (default: 8) */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
  /** Password strength criteria */
  criteria?: {
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  };
  /** UI options */
  ui?: {
    /** Show strength indicator */
    strengthIndicator?: boolean;
    /** Show requirements checklist */
    showRequirements?: boolean;
    /** Allow password generation */
    allowGenerate?: boolean;
    /** Show copy button to copy value to clipboard */
    copyable?: boolean;
  };
}

/**
 * Textarea field
 */
export interface TextareaField extends BaseField<string> {
  type: "textarea";
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
  /** Number of visible rows */
  rows?: number;
  /** Auto-resize based on content */
  autoResize?: boolean;
  /** UI options */
  ui?: {
    /** Show copy button to copy value to clipboard */
    copyable?: boolean;
  };
}

/**
 * Number field
 */
export interface NumberField extends BaseField<number> {
  type: "number";
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Decimal precision */
  precision?: number;
  /** UI options */
  ui?: {
    /** Step increment */
    step?: number;
    /** Visual variant */
    variant?: "default" | "stacked" | "pill" | "plain";
    /** Prefix (e.g., "$") */
    prefix?: string;
    /** Suffix (e.g., "%", "kg") */
    suffix?: string;
    /** Use thousand separator */
    thousandSeparator?: boolean | string;
    /** Hide stepper buttons */
    hideSteppers?: boolean;
    /** Show copy button to copy value to clipboard */
    copyable?: boolean;
  };
}

/**
 * Date field
 */
export interface DateField extends BaseField<Date> {
  type: "date";
  /** Minimum date */
  minDate?: Date | string;
  /** Maximum date */
  maxDate?: Date | string;
  /** UI options */
  ui?: {
    /** Display format (date-fns format) */
    format?: string;
    /** Manual input format */
    inputFormat?: string;
    /** Quick date presets */
    presets?:
      | boolean
      | Array<{
          label: string;
          value: Date | (() => Date);
        }>;
  };
}

/**
 * Datetime field
 */
export interface DatetimeField extends BaseField<Date> {
  type: "datetime";
  /** Minimum date */
  minDate?: Date | string;
  /** Maximum date */
  maxDate?: Date | string;
  /** UI options */
  ui?: {
    /** Display format (date-fns format) */
    format?: string;
    /** Manual input format */
    inputFormat?: string;
    /** Time picker config */
    timePicker?:
      | boolean
      | {
          interval?: number;
          use24hr?: boolean;
          includeSeconds?: boolean;
        };
    /** Quick date presets */
    presets?:
      | boolean
      | Array<{
          label: string;
          value: Date | (() => Date);
        }>;
  };
}

/**
 * Select option
 */
export interface SelectOption {
  /** Display label */
  label: string | ReactNode;
  /** Option value (supports string, number, or boolean for API compatibility) */
  value: string | number | boolean;
  /** Optional description */
  description?: string | ReactNode;
  /** Optional icon */
  icon?: ReactNode;
  /** Optional badge */
  badge?: string;
  /** Whether disabled */
  disabled?: boolean;
}

/**
 * Select field
 */
export interface SelectField extends BaseField<
  string | string[] | number | number[] | boolean
> {
  type: "select";
  /** Options (static, string array, or async with context for dependent dropdowns) */
  options:
    | SelectOption[]
    | string[]
    | ((context: ValidationContext) => Promise<SelectOption[]>);
  /**
   * Field paths that trigger options refetch when changed.
   * Required when using async options that depend on other field values.
   * @example dependencies: ['country', 'state'] // Refetch when country or state changes
   */
  dependencies?: string[];
  /** Allow multiple selections */
  hasMany?: boolean;
  /** Minimum number of selections (when hasMany is true) */
  minSelected?: number;
  /** Maximum number of selections (when hasMany is true) */
  maxSelected?: number;
  /** UI options */
  ui?: {
    /** Enable search */
    isSearchable?: boolean;
    /** Show clear button */
    isClearable?: boolean;
    /** Max visible chips (for hasMany) */
    maxVisibleChips?: number;
    /** Empty state message */
    emptyMessage?: string;
    /** Loading message */
    loadingMessage?: string;
  };
}

/**
 * Checkbox group field - multiple selections from a list of options
 */
export interface CheckboxGroupField extends BaseField<
  Array<string | number | boolean>
> {
  type: "checkbox-group";
  /** Static array or async function for options */
  options:
    | SelectOption[]
    | string[]
    | ((context: ValidationContext) => Promise<SelectOption[]>);
  /** Paths that trigger options refetch when changed */
  dependencies?: string[];
  /** Minimum number of selections */
  minSelected?: number;
  /** Maximum number of selections */
  maxSelected?: number;
  /** UI options */
  ui?: {
    /** Layout direction */
    direction?: "vertical" | "horizontal";
    /** Grid columns (responsive, 1 on mobile) */
    columns?: 1 | 2 | 3 | 4;
    /** Visual variant */
    variant?: "default" | "card";
    /** Card settings (for variant: 'card') */
    card?: {
      /** Size preset ('sm', 'md', 'lg') */
      size?: "sm" | "md" | "lg";
      /** Show border around cards */
      bordered?: boolean;
    };
  };
}

/**
 * Checkbox field
 */
export interface CheckboxField extends BaseField<boolean> {
  type: "checkbox";
}

/**
 * Switch field
 */
export interface SwitchField extends BaseField<boolean> {
  type: "switch";
  /** UI options */
  ui?: {
    /**
     * Switch position relative to label.
     * - 'between': Label on left, switch on right with full-width spacing (default)
     * - 'start': Switch on left, label on right
     * - 'end': Label on left, switch on right
     */
    alignment?: "start" | "end" | "between";
  };
}

/**
 * Radio field - single selection from a group of options
 */
export interface RadioField extends BaseField<string | number | boolean> {
  type: "radio";
  /** Static array or async function for options */
  options:
    | SelectOption[]
    | string[]
    | ((context: ValidationContext) => Promise<SelectOption[]>);
  /** Paths that trigger options refetch when changed */
  dependencies?: string[];
  ui?: {
    /** Visual variant ('default' or 'card') */
    variant?: "default" | "card";
    /** Layout direction for 'default' variant */
    direction?: "vertical" | "horizontal";
    /** Grid columns (responsive, 1 on mobile) */
    columns?: 1 | 2 | 3 | 4;
    /** Card settings (for variant: 'card') */
    card?: {
      /** Size preset ('sm', 'md', 'lg') */
      size?: "sm" | "md" | "lg";
      /** Show border around cards */
      bordered?: boolean;
    };
  };
}

/**
 * Tags field - chip-based multi-value string input
 */
export interface TagsField extends BaseField<string[]> {
  type: "tags";
  /** Minimum number of tags */
  minTags?: number;
  /** Maximum number of tags */
  maxTags?: number;
  /** Maximum character length per tag */
  maxTagLength?: number;
  /** Allow duplicate tag values (default: false) */
  allowDuplicates?: boolean;
  /** UI options */
  ui?: {
    /** Keys that create a new tag (default: ['enter']) */
    delimiters?: ("enter" | "comma" | "space" | "tab")[];
    /** Visual variant */
    variant?: "chips" | "pills" | "inline";
    /** Show copy button to copy all tags */
    copyable?: boolean;
  };
}

/**
 * Upload field
 */
export interface UploadField extends BaseField<
  File | File[] | string | string[]
> {
  type: "upload";
  /** Allow multiple files */
  hasMany?: boolean;
  /** Minimum files (when hasMany) */
  minFiles?: number;
  /** Maximum files (when hasMany) */
  maxFiles?: number;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** UI options */
  ui?: {
    /** MIME type filter */
    accept?: string;
    /** Visual variant */
    variant?: "dropzone" | "avatar" | "inline" | "gallery";
    /** Shape (for avatar) */
    shape?: "circle" | "square" | "rounded";
    /** Size preset */
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    /** Enable cropping */
    crop?:
      | boolean
      | {
          aspectRatio?: number;
          circular?: boolean;
        };
    /** Show progress */
    showProgress?: boolean;
    /** Dropzone text */
    dropzoneText?: string;
  };
}

// =============================================================================
// LAYOUT FIELDS
// =============================================================================

/**
 * Group field - wraps fields in a named object
 */
export interface GroupField extends BaseField<Record<string, unknown>> {
  type: "group";
  /** Nested fields */
  fields: Field[];
  /** UI options */
  ui?: {
    /** Visual variant ('card', 'flat', 'ghost', 'bordered') */
    variant?: "card" | "flat" | "ghost" | "bordered";
    /** Spacing between fields ('sm', 'md', 'lg') */
    spacing?: "sm" | "md" | "lg";
    /** Start in collapsed state */
    collapsed?: boolean;
    /** Show error badge */
    showErrorBadge?: boolean;
  };
}

/**
 * Array field - repeatable fields
 */
export interface ArrayField extends BaseField<unknown[]> {
  type: "array";
  /** Fields for each array item */
  fields: Field[];
  /** Minimum items */
  minRows?: number;
  /** Maximum items */
  maxRows?: number;
  /** UI options */
  ui?: {
    /** Allow reordering via drag & drop (default: true) */
    isSortable?: boolean;
    /** Add button label (default: "Add Item") */
    addLabel?: string;
    /** Field name to use for row labels (falls back to first named field) */
    rowLabelField?: string;
    /** Start the array container collapsed */
    collapsed?: boolean;
    /** Start individual rows collapsed */
    rowsCollapsed?: boolean;
    /** Show confirmation dialog before deleting all items */
    confirmDelete?: boolean;
    /** Custom empty state message */
    emptyMessage?: string;
    /** Show error count badge in header (default: true) */
    showErrorBadge?: boolean;
  };
}

/**
 * Row field - horizontal layout container
 */
export interface RowField {
  type: "row";
  /** Fields to display in a row */
  fields: Field[];
  /** Layout options */
  ui?: {
    /** Gap between fields (e.g., 4, '1rem', '16px') */
    gap?: number | string;
    /** Vertical alignment */
    align?: "start" | "center" | "end" | "stretch";
    /** Horizontal distribution */
    justify?: "start" | "center" | "end" | "between";
    /** Allow wrapping to next line */
    wrap?: boolean;
    /** Responsive behavior: 'stack' collapses to vertical on mobile */
    responsive?: boolean | "stack";
  };
}

/**
 * Tab configuration
 */
export interface Tab {
  /** Tab name (if provided, creates nested object) */
  name?: string;
  /** Tab label */
  label: string | ReactNode;
  /** Fields in this tab */
  fields: Field[];
  /** Tab description */
  description?: string | ReactNode;
  /** Tab icon */
  icon?: ReactNode;
  /** Whether this tab is disabled */
  disabled?: boolean;
}

/**
 * Tabs field - tabbed container
 */
export interface TabsField {
  type: "tabs";
  /** Tab definitions */
  tabs: Tab[];
  /** UI options */
  ui?: {
    /** Default active tab (index or name) */
    defaultTab?: number | string;
    /** Show error badge on tabs with validation errors */
    showErrorBadge?: boolean;
    /** Visual variant */
    variant?: "default" | "line";
    /** Spacing between fields within tabs */
    spacing?: "sm" | "md" | "lg";
  };
}

/**
 * Collapsible field - expandable container
 */
export interface CollapsibleField {
  type: "collapsible";
  /** Container label */
  label: string;
  /** Nested fields */
  fields: Field[];
  /** Start collapsed */
  collapsed?: boolean;
  /** UI options */
  ui?: {
    /** Visual variant ('card', 'flat', 'ghost', 'bordered') */
    variant?: "card" | "flat" | "ghost" | "bordered";
    /** Spacing between fields ('sm', 'md', 'lg') */
    spacing?: "sm" | "md" | "lg";
    /** Show error badge */
    showErrorBadge?: boolean;
    /** Optional description */
    description?: string;
    /** Optional icon */
    icon?: ReactNode;
  };
  /** Styling options */
  style?: FieldStyle;
}

// =============================================================================
// FIELD UNION TYPE
// =============================================================================

/**
 * Union of all field types.
 */
export type Field =
  | TextField
  | EmailField
  | PasswordField
  | TextareaField
  | NumberField
  | DateField
  | DatetimeField
  | SelectField
  | CheckboxGroupField
  | CheckboxField
  | SwitchField
  | RadioField
  | TagsField
  | UploadField
  | GroupField
  | ArrayField
  | RowField
  | TabsField
  | CollapsibleField;

/**
 * Extract field type from a Field.
 */
export type FieldType = Field["type"];

/**
 * Data fields (fields that hold values).
 */
export type DataField =
  | TextField
  | EmailField
  | PasswordField
  | TextareaField
  | NumberField
  | DateField
  | DatetimeField
  | SelectField
  | CheckboxGroupField
  | CheckboxField
  | SwitchField
  | RadioField
  | TagsField
  | UploadField
  | GroupField
  | ArrayField;

/**
 * Layout fields (fields that organize other fields).
 */
export type LayoutField = RowField | TabsField | CollapsibleField;
