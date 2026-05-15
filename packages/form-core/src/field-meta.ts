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
  /** Indicates if this field can contain other fields */
  hasChildren?: boolean;
}

export const FIELD_TYPE_META: Record<FieldType, FieldTypeMeta> = {
  text: {
    type: "text",
    category: "input",
    description: "Standard single-line text input",
    requiredProps: ["type", "name"],
    optionalProps: ["label", "description", "placeholder", "required", "disabled", "readOnly", "hidden", "condition", "defaultValue", "trim", "minLength", "maxLength", "pattern"],
    applicableValidators: ["required", "minLength", "maxLength", "pattern", "matches"],
    example: { type: "text", name: "firstName", label: "First Name" }
  },
  email: {
    type: "email",
    category: "input",
    description: "Email address input with automatic format validation",
    requiredProps: ["type", "name"],
    optionalProps: ["label", "description", "placeholder", "required", "disabled", "readOnly", "hidden", "condition", "defaultValue", "minLength", "maxLength"],
    applicableValidators: ["required", "email", "minLength", "maxLength", "matches"],
    example: { type: "email", name: "userEmail", label: "Email Address" }
  },
  password: {
    type: "password",
    category: "input",
    description: "Masked password input with strength criteria support",
    requiredProps: ["type", "name"],
    optionalProps: ["label", "description", "placeholder", "required", "disabled", "readOnly", "hidden", "condition", "defaultValue", "minLength", "maxLength", "criteria"],
    applicableValidators: ["required", "minLength", "maxLength", "matches", "passwordCriteria"],
    example: { type: "password", name: "newPassword", label: "Password" }
  },
  textarea: {
    type: "textarea",
    category: "input",
    description: "Multi-line text input",
    requiredProps: ["type", "name"],
    optionalProps: ["label", "description", "placeholder", "required", "disabled", "readOnly", "hidden", "condition", "defaultValue", "trim", "minLength", "maxLength", "pattern"],
    applicableValidators: ["required", "minLength", "maxLength", "pattern", "matches"],
    example: { type: "textarea", name: "bio", label: "Biography" }
  },
  number: {
    type: "number",
    category: "input",
    description: "Numeric input",
    requiredProps: ["type", "name"],
    optionalProps: ["label", "description", "placeholder", "required", "disabled", "readOnly", "hidden", "condition", "defaultValue", "min", "max", "precision", "step"],
    applicableValidators: ["required", "min", "max", "precision", "step"],
    example: { type: "number", name: "age", label: "Age" }
  },
  date: {
    type: "date",
    category: "input",
    description: "Date picker, optionally with time",
    requiredProps: ["type", "name"],
    optionalProps: ["label", "description", "placeholder", "required", "disabled", "readOnly", "hidden", "condition", "defaultValue", "withTime", "minDate", "maxDate"],
    applicableValidators: ["required", "minDate", "maxDate"],
    example: { type: "date", name: "birthdate", label: "Birth Date" }
  },
  tags: {
    type: "tags",
    category: "input",
    description: "Multi-value chip/tag input (string array)",
    requiredProps: ["type", "name"],
    optionalProps: ["label", "description", "placeholder", "required", "disabled", "readOnly", "hidden", "condition", "defaultValue", "minTags", "maxTags", "maxTagLength", "allowDuplicates"],
    applicableValidators: ["required", "minTags", "maxTags"],
    example: { type: "tags", name: "skills", label: "Skills" }
  },
  select: {
    type: "select",
    category: "choice",
    description: "Dropdown selection (single or multi-select via hasMany)",
    requiredProps: ["type", "name", "options"],
    optionalProps: ["label", "description", "placeholder", "required", "disabled", "readOnly", "hidden", "condition", "defaultValue", "hasMany", "minSelected", "maxSelected"],
    applicableValidators: ["required", "minSelected", "maxSelected"],
    example: { type: "select", name: "country", label: "Country", options: [{ label: "USA", value: "us" }] }
  },
  checkbox: {
    type: "checkbox",
    category: "choice",
    description: "Checkbox input (single boolean, tristate boolean, or multi-select group via hasMany)",
    requiredProps: ["type", "name"],
    optionalProps: ["label", "description", "placeholder", "required", "disabled", "readOnly", "hidden", "condition", "defaultValue", "hasMany", "tristate", "options", "minSelected", "maxSelected"],
    applicableValidators: ["required", "minSelected", "maxSelected"],
    example: { type: "checkbox", name: "terms", label: "Accept Terms" }
  },
  switch: {
    type: "switch",
    category: "choice",
    description: "Toggle switch (boolean)",
    requiredProps: ["type", "name"],
    optionalProps: ["label", "description", "placeholder", "required", "disabled", "readOnly", "hidden", "condition", "defaultValue"],
    applicableValidators: ["required"],
    example: { type: "switch", name: "notifications", label: "Enable Notifications" }
  },
  radio: {
    type: "radio",
    category: "choice",
    description: "Radio button group for single selection",
    requiredProps: ["type", "name", "options"],
    optionalProps: ["label", "description", "placeholder", "required", "disabled", "readOnly", "hidden", "condition", "defaultValue"],
    applicableValidators: ["required"],
    example: { type: "radio", name: "plan", label: "Plan", options: [{ label: "Basic", value: "basic" }] }
  },
  group: {
    type: "group",
    category: "container",
    description: "Groups fields into a nested object",
    requiredProps: ["type", "name", "fields"],
    optionalProps: ["label", "description", "hidden", "condition", "disabled", "readOnly"],
    applicableValidators: [],
    example: { type: "group", name: "address", fields: [{ type: "text", name: "city" }] },
    hasChildren: true
  },
  array: {
    type: "array",
    category: "container",
    description: "List of items (objects or primitives)",
    requiredProps: ["type", "name", "fields"],
    optionalProps: ["label", "description", "hidden", "condition", "primitive", "minItems", "maxItems", "disabled", "readOnly"],
    applicableValidators: ["minItems", "maxItems"],
    example: { type: "array", name: "users", fields: [{ type: "text", name: "name" }] },
    hasChildren: true
  },
  row: {
    type: "row",
    category: "layout",
    description: "Horizontal flex layout",
    requiredProps: ["type", "fields"],
    optionalProps: ["hidden", "condition"],
    applicableValidators: [],
    example: { type: "row", fields: [{ type: "text", name: "firstName" }, { type: "text", name: "lastName" }] },
    hasChildren: true
  },
  tabs: {
    type: "tabs",
    category: "layout",
    description: "Tabbed container layout",
    requiredProps: ["type", "tabs"],
    optionalProps: ["hidden", "condition"],
    applicableValidators: [],
    example: { type: "tabs", tabs: [{ label: "General", fields: [] }] },
    hasChildren: true
  },
  collapsible: {
    type: "collapsible",
    category: "layout",
    description: "Expandable/collapsible container",
    requiredProps: ["type", "label", "fields"],
    optionalProps: ["hidden", "condition", "collapsed"],
    applicableValidators: [],
    example: { type: "collapsible", label: "Advanced", fields: [] },
    hasChildren: true
  }
} as unknown as Record<FieldType, FieldTypeMeta>;

export function getFieldMeta(type: string): FieldTypeMeta | undefined {
  return FIELD_TYPE_META[type as FieldType];
}

export function getFieldsByCategory(category: FieldCategory): FieldTypeMeta[] {
  return Object.values(FIELD_TYPE_META).filter((meta) => meta && meta.category === category);
}
