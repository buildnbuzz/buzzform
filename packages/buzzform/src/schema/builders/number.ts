import { z } from 'zod';
import type { NumberField } from '../../types';
import { coerceToNumber, makeOptional, applyCustomValidation } from '../helpers';

/**
 * Creates Zod schema for number fields.
 */
export function createNumberFieldSchema(field: NumberField): z.ZodTypeAny {
    let numSchema = z.number({ invalid_type_error: 'Must be a number' });

    // Min/max constraints
    if (field.min !== undefined) {
        numSchema = numSchema.min(field.min, `Must be at least ${field.min}`);
    }
    if (field.max !== undefined) {
        numSchema = numSchema.max(field.max, `Must be at most ${field.max}`);
    }

    // Coercion: empty/null/undefined → undefined, otherwise Number()
    let schema: z.ZodTypeAny = z.preprocess(coerceToNumber, numSchema);

    // Apply custom validation
    schema = applyCustomValidation(schema, field, field.name);

    if (field.required) {
        return schema;
    }

    return makeOptional(schema, 'number');
}
