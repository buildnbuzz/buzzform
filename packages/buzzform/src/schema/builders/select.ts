import { z } from 'zod';
import type { SelectField, RadioField } from '../../types';
import { makeOptional, applyCustomValidation } from '../helpers';

/**
 * Base schema for select/radio values.
 * Supports string, number, and boolean as per SelectOption.value type.
 */
const selectValueSchema = z.union([z.string(), z.number(), z.boolean()]);

/**
 * Creates Zod schema for select fields.
 */
export function createSelectFieldSchema(field: SelectField): z.ZodTypeAny {
    // Handle hasMany (multi-select)
    if (field.hasMany) {
        let arraySchema = z.array(selectValueSchema);

        if (field.required) {
            arraySchema = arraySchema.min(1, 'Select at least one option');
        }

        let schema: z.ZodTypeAny = applyCustomValidation(arraySchema, field, field.name);

        if (!field.required) {
            return schema.optional().default([]);
        }
        return schema;
    }

    // Single select
    let schema: z.ZodTypeAny = selectValueSchema;

    if (field.required) {
        // For required fields, we need to ensure a value was selected
        schema = selectValueSchema.refine(
            (val) => val !== '' && val !== null && val !== undefined,
            'Please select an option'
        );
    }

    schema = applyCustomValidation(schema, field, field.name);

    if (!field.required) {
        return makeOptional(schema, 'select');
    }

    return schema;
}

/**
 * Creates Zod schema for radio fields.
 */
export function createRadioFieldSchema(field: RadioField): z.ZodTypeAny {
    let schema: z.ZodTypeAny = selectValueSchema;

    if (field.required) {
        schema = selectValueSchema.refine(
            (val) => val !== '' && val !== null && val !== undefined,
            'Please select an option'
        );
    }

    schema = applyCustomValidation(schema, field, field.name);

    if (!field.required) {
        return makeOptional(schema, 'radio');
    }

    return schema;
}
