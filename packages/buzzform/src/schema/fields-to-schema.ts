import { z } from "zod";
import type {
  Field,
  TabsField,
  TextField,
  EmailField,
  PasswordField,
  TextareaField,
  NumberField,
  DateField,
  DatetimeField,
  SelectField,
  CheckboxGroupField,
  RadioField,
  CheckboxField,
  SwitchField,
  UploadField,
  TagsField,
  ArrayField,
  GroupField,
  FieldsToShape,
} from "../types";
import {
  createTextFieldSchema,
  createEmailFieldSchema,
  createPasswordFieldSchema,
  createNumberFieldSchema,
  createDateFieldSchema,
  createSelectFieldSchema,
  createCheckboxGroupFieldSchema,
  createRadioFieldSchema,
  createCheckboxFieldSchema,
  createSwitchFieldSchema,
  createUploadFieldSchema,
  createTagsFieldSchema,
  createArrayFieldSchema,
  createGroupFieldSchema,
} from "./builders";

function fieldToZod(field: Field): z.ZodTypeAny {
  if ("schema" in field && field.schema) {
    return field.schema as z.ZodTypeAny;
  }

  switch (field.type) {
    case "text":
      return createTextFieldSchema(field as TextField);
    case "email":
      return createEmailFieldSchema(field as EmailField);
    case "password":
      return createPasswordFieldSchema(field as PasswordField);
    case "textarea":
      return createTextFieldSchema(field as TextareaField);
    case "number":
      return createNumberFieldSchema(field as NumberField);
    case "date":
    case "datetime":
      return createDateFieldSchema(field as DateField | DatetimeField);
    case "select":
      return createSelectFieldSchema(field as SelectField);
    case "checkbox-group":
      return createCheckboxGroupFieldSchema(field as CheckboxGroupField);
    case "radio":
      return createRadioFieldSchema(field as RadioField);
    case "checkbox":
      return createCheckboxFieldSchema(field as CheckboxField);
    case "switch":
      return createSwitchFieldSchema(field as SwitchField);
    case "upload":
      return createUploadFieldSchema(field as UploadField);
    case "tags":
      return createTagsFieldSchema(field as TagsField);
    case "array":
      return createArrayFieldSchema(field as ArrayField, fieldsToZodSchema);
    case "group":
      return createGroupFieldSchema(field as GroupField, fieldsToZodSchema);
    case "row":
    case "collapsible":
    case "tabs":
      return z.any();
    default:
      return z.any();
  }
}

function processTabsField(field: TabsField): Record<string, z.ZodTypeAny> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const tab of field.tabs) {
    if (tab.name) {
      const tabSchema = fieldsToZodSchema(tab.fields);
      shape[tab.name] = tabSchema;
    } else {
      const tabFieldsSchema = fieldsToZodSchema(tab.fields);
      if (tabFieldsSchema instanceof z.ZodObject) {
        Object.assign(shape, tabFieldsSchema.shape);
      }
    }
  }

  return shape;
}

/**
 * Converts field definitions to a Zod schema.
 *
 * Note: Custom validation (field.validate) is handled by the zodResolver,
 * not at the schema level. This ensures custom validators run even when
 * other fields have errors.
 */
export function fieldsToZodSchema<T extends readonly Field[]>(
  fields: T,
): z.ZodObject<FieldsToShape<T>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if ("name" in field && field.name) {
      shape[field.name] = fieldToZod(field);
    } else if (field.type === "tabs") {
      const tabsShape = processTabsField(field);
      Object.assign(shape, tabsShape);
    } else if (field.type === "row" || field.type === "collapsible") {
      const nestedSchema = fieldsToZodSchema(field.fields);
      if (nestedSchema instanceof z.ZodObject) {
        Object.assign(shape, nestedSchema.shape);
      }
    }
  }

  return z.object(shape) as z.ZodObject<FieldsToShape<T>>;
}
