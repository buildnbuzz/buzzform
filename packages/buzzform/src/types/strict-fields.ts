/**
 * Strict field typing utilities for compile-time validation.
 */

import type {
  TextField,
  EmailField,
  PasswordField,
  TextareaField,
  NumberField,
  DateField,
  DatetimeField,
  SelectField,
  CheckboxGroupField,
  CheckboxField,
  SwitchField,
  RadioField,
  TagsField,
  UploadField,
  GroupField,
  ArrayField,
  RowField,
  TabsField,
  CollapsibleField,
  Field,
} from "./field";

// =============================================================================
// FIELD TYPE MAP
// =============================================================================

/**
 * Maps field type literals to their corresponding interface.
 */
export interface FieldTypeMap {
  text: TextField;
  email: EmailField;
  password: PasswordField;
  textarea: TextareaField;
  number: NumberField;
  date: DateField;
  datetime: DatetimeField;
  select: SelectField;
  "checkbox-group": CheckboxGroupField;
  checkbox: CheckboxField;
  switch: SwitchField;
  radio: RadioField;
  tags: TagsField;
  upload: UploadField;
  group: GroupField;
  array: ArrayField;
  row: RowField;
  tabs: TabsField;
  collapsible: CollapsibleField;
}

export type FieldTypeLiteral = keyof FieldTypeMap;

// =============================================================================
// STRICT FIELD VALIDATION
// =============================================================================

/**
 * Resolves a field object to its strict interface based on the `type` property.
 */
export type StrictFieldByType<T> = T extends {
  type: infer Type extends FieldTypeLiteral;
}
  ? FieldTypeMap[Type]
  : T extends Field
    ? T
    : never;

/**
 * Validates an array of fields, ensuring each matches its declared type's interface.
 */
export type StrictFieldArray<T extends readonly unknown[]> = {
  [K in keyof T]: StrictFieldByType<T[K]>;
};
