"use client";

import type { FieldRegistry } from "@buildnbuzz/form-react";

import { TextField } from "./fields/text";
import { EmailField } from "./fields/email";
import { PasswordField } from "./fields/password";
import { RowField } from "./fields/row";
import { TextareaField } from "./fields/textarea";
import { NumberField } from "./fields/number";
import { SelectField } from "./fields/select";
import { CheckboxField } from "./fields/checkbox";
import { SwitchField } from "./fields/switch";
import { RadioField } from "./fields/radio";
import { GroupField } from "./fields/group";
import { ArrayField } from "./fields/array";
import { TabsField } from "./fields/tabs";
import { CollapsibleField } from "./fields/collapsible";
import { DateField } from "./fields/date";
import { TagsField } from "./fields/tags";

export const registry: FieldRegistry = {
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
};
