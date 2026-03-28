"use client";

import { TextField } from "./text";
import { EmailField } from "./email";
import { PasswordField } from "./password";
import { RowField } from "./row";
import { TextareaField } from "./textarea";
import { NumberField } from "./number";
import { SelectField } from "./select";
import { CheckboxField } from "./checkbox";
import { SwitchField } from "./switch";
import { RadioField } from "./radio";
import { GroupField } from "./group";
import { ArrayField } from "./array";
import { TabsField } from "./tabs";
import { CollapsibleField } from "./collapsible";
import { DateField } from "./date";
import { TagsField } from "./tags";

// Default shadcn registry — maps field types to shadcn-styled components.
export const shadcnRegistry = {
  text: TextField,
  email: EmailField,
  password: PasswordField,
  row: RowField,
  textarea: TextareaField,
  number: NumberField,
  select: SelectField,
  checkbox: CheckboxField,
  switch: SwitchField,
  radio: RadioField,
  group: GroupField,
  array: ArrayField,
  tabs: TabsField,
  collapsible: CollapsibleField,
  date: DateField,
  tags: TagsField,
} as const;
