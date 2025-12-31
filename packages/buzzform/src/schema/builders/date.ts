import { z } from 'zod';
import type { DateField } from '../../types';
import { coerceToDate, makeOptional, applyCustomValidation } from '../helpers';

/**
 * Parse a value to a Date object for constraint checking.
 */
function toDate(value?: string | Date): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
}

/**
 * Creates Zod schema for date and datetime fields.
 */
export function createDateFieldSchema(field: DateField): z.ZodTypeAny {
    const isDatetime = field.type === 'datetime';

    // Parse min/max dates from field config
    const minDate = toDate(field.minDate);
    const maxDate = toDate(field.maxDate);

    // Build base date schema
    let dateSchema = z.date({ invalid_type_error: 'Please enter a valid date' });

    // Add min date constraint
    if (minDate) {
        const formattedDate = isDatetime ? minDate.toLocaleString() : minDate.toDateString();
        dateSchema = dateSchema.min(minDate, {
            message: `Date must be on or after ${formattedDate}`,
        });
    }

    // Add max date constraint
    if (maxDate) {
        const formattedDate = isDatetime ? maxDate.toLocaleString() : maxDate.toDateString();
        dateSchema = dateSchema.max(maxDate, {
            message: `Date must be on or before ${formattedDate}`,
        });
    }

    // Coercion from various input types
    let schema: z.ZodTypeAny = z.preprocess(coerceToDate, dateSchema);

    // Apply custom validation
    schema = applyCustomValidation(schema, field, field.name);

    if (field.required) {
        return schema.refine(
            (val) => val instanceof Date && !isNaN(val.getTime()),
            'Date is required'
        );
    }

    return makeOptional(schema, 'date');
}
