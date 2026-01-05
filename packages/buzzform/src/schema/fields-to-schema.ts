import { z } from 'zod';
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
    RadioField,
    CheckboxField,
    SwitchField,
    UploadField,
    TagsField,
    ArrayField,
    GroupField,
    FieldsToShape,
} from '../types';
import {
    createTextFieldSchema,
    createEmailFieldSchema,
    createPasswordFieldSchema,
    createNumberFieldSchema,
    createDateFieldSchema,
    createSelectFieldSchema,
    createRadioFieldSchema,
    createCheckboxFieldSchema,
    createSwitchFieldSchema,
    createUploadFieldSchema,
    createTagsFieldSchema,
    createArrayFieldSchema,
    createGroupFieldSchema,
} from './builders';

// =============================================================================
// FIELD TO ZOD SCHEMA
// =============================================================================

/**
 * Converts a single field to a Zod schema.
 */
function fieldToZod(field: Field): z.ZodTypeAny {
    // If field has a direct Zod schema override, use it
    if ('schema' in field && field.schema) {
        return field.schema as z.ZodTypeAny;
    }

    switch (field.type) {
        // Text-based fields
        case 'text':
            return createTextFieldSchema(field as TextField);
        case 'email':
            return createEmailFieldSchema(field as EmailField);
        case 'password':
            return createPasswordFieldSchema(field as PasswordField);
        case 'textarea':
            return createTextFieldSchema(field as TextareaField);

        // Number
        case 'number':
            return createNumberFieldSchema(field as NumberField);

        // Date
        case 'date':
        case 'datetime':
            return createDateFieldSchema(field as DateField | DatetimeField);

        // Selection
        case 'select':
            return createSelectFieldSchema(field as SelectField);
        case 'radio':
            return createRadioFieldSchema(field as RadioField);

        // Boolean
        case 'checkbox':
            return createCheckboxFieldSchema(field as CheckboxField);
        case 'switch':
            return createSwitchFieldSchema(field as SwitchField);

        // Upload
        case 'upload':
            return createUploadFieldSchema(field as UploadField);

        // Tags
        case 'tags':
            return createTagsFieldSchema(field as TagsField);

        // Composite (recursive)
        case 'array':
            return createArrayFieldSchema(field as ArrayField, fieldsToZodSchema);
        case 'group':
            return createGroupFieldSchema(field as GroupField, fieldsToZodSchema);

        // Layout fields don't produce schemas directly
        case 'row':
        case 'collapsible':
        case 'tabs':
            return z.any();

        default:
            return z.any();
    }
}

// =============================================================================
// TABS FIELD HANDLING
// =============================================================================

/**
 * Processes a tabs field to extract schema shape.
 * Named tabs create nested objects, unnamed tabs flatten.
 */
function processTabsField(field: TabsField): Record<string, z.ZodTypeAny> {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const tab of field.tabs) {
        if (tab.name) {
            // Named tab: create nested object under tab.name
            const tabSchema = fieldsToZodSchema(tab.fields);
            shape[tab.name] = tabSchema;
        } else {
            // Unnamed tab: flatten fields into parent shape
            const tabFieldsSchema = fieldsToZodSchema(tab.fields);
            if (tabFieldsSchema instanceof z.ZodObject) {
                Object.assign(shape, tabFieldsSchema.shape);
            }
        }
    }

    return shape;
}

// =============================================================================
// FIELDS TO ZOD SCHEMA
// =============================================================================

/**
 * Converts an array of field definitions to a Zod object schema.
 * Handles all field types including layouts and nested structures.
 */
export function fieldsToZodSchema<T extends readonly Field[]>(
    fields: T
): z.ZodObject<FieldsToShape<T>> {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const field of fields) {
        if ('name' in field && field.name) {
            // Data field with name - add to schema
            shape[field.name] = fieldToZod(field);
        } else if (field.type === 'tabs') {
            // Named tabs create nested, unnamed flatten
            const tabsShape = processTabsField(field);
            Object.assign(shape, tabsShape);
        } else if (field.type === 'row' || field.type === 'collapsible') {
            // Layout fields: flatten nested fields into parent
            const nestedSchema = fieldsToZodSchema(field.fields);
            if (nestedSchema instanceof z.ZodObject) {
                Object.assign(shape, nestedSchema.shape);
            }
        }
        // Other layout fields without name are skipped
    }

    return z.object(shape) as z.ZodObject<FieldsToShape<T>>;
}
