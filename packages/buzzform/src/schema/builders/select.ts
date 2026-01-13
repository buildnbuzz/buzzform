import { z } from 'zod';
import type { SelectField, RadioField } from '../../types';
import { makeOptional } from '../helpers';

// Base schema for select/radio values with user-friendly error messages
const selectValueSchema = z.union([
    z.string({ error: 'Please select an option' }),
    z.number({ error: 'Please select an option' }),
    z.boolean({ error: 'Please select an option' }),
], { error: 'Please select an option' });

export function createSelectFieldSchema(field: SelectField): z.ZodTypeAny {
    if (field.hasMany) {
        let arraySchema = z.array(selectValueSchema, { error: 'Invalid selection' });

        if (field.required) {
            arraySchema = arraySchema.min(1, 'Select at least one option');
        }

        if (!field.required) {
            return arraySchema.optional().default([]);
        }
        return arraySchema;
    }

    let schema: z.ZodTypeAny = selectValueSchema;

    if (field.required) {
        schema = selectValueSchema.refine(
            (val) => val !== '' && val !== null && val !== undefined,
            'Please select an option'
        );
    }

    if (!field.required) {
        return makeOptional(schema, 'select');
    }

    return schema;
}

export function createRadioFieldSchema(field: RadioField): z.ZodTypeAny {
    let schema: z.ZodTypeAny = selectValueSchema;

    if (field.required) {
        schema = selectValueSchema.refine(
            (val) => val !== '' && val !== null && val !== undefined,
            'Please select an option'
        );
    }

    if (!field.required) {
        return makeOptional(schema, 'radio');
    }

    return schema;
}
