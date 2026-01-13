import { z } from 'zod';
import type { DateField, DatetimeField } from '../../types';
import { coerceToDate, makeOptional } from '../helpers';

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
 * Note: Custom validation (field.validate) is handled at root schema level.
 */
export function createDateFieldSchema(field: DateField | DatetimeField): z.ZodTypeAny {
    const isDatetime = field.type === 'datetime';

    // Parse min/max dates from field config
    const minDate = toDate(field.minDate);
    const maxDate = toDate(field.maxDate);

    // Build base date schema
    let dateSchema = z.date({ error: 'Please enter a valid date' });

    // Add min date constraint
    if (minDate) {
        const formattedDate = isDatetime ? minDate.toLocaleString() : minDate.toDateString();
        dateSchema = dateSchema.min(minDate, {
            error: `Date must be on or after ${formattedDate}`,
        });
    }

    // Add max date constraint
    if (maxDate) {
        const formattedDate = isDatetime ? maxDate.toLocaleString() : maxDate.toDateString();
        dateSchema = dateSchema.max(maxDate, {
            error: `Date must be on or before ${formattedDate}`,
        });
    }

    // Coercion from various input types
    const schema: z.ZodTypeAny = z.preprocess(coerceToDate, dateSchema);

    if (field.required) {
        return schema.refine(
            (val) => val instanceof Date && !isNaN(val.getTime()),
            'Date is required'
        );
    }

    return makeOptional(schema, 'date');
}
