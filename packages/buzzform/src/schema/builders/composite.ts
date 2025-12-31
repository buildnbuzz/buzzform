import { z } from 'zod';
import type { ArrayField, GroupField } from '../../types';

// Note: These import from the parent module to avoid circular deps
// The fieldsToZodSchema function is passed as a parameter

type SchemaGenerator = (fields: readonly any[]) => z.ZodObject<any>;

/**
 * Creates Zod schema for array fields.
 * Uses passed-in schema generator to handle nested fields.
 */
export function createArrayFieldSchema(
    field: ArrayField,
    fieldsToZodSchema: SchemaGenerator
): z.ZodTypeAny {
    const itemSchema = fieldsToZodSchema(field.fields);
    let schema = z.array(itemSchema);

    if (field.minRows !== undefined) {
        schema = schema.min(
            field.minRows,
            `At least ${field.minRows} row${field.minRows !== 1 ? 's' : ''} required`
        );
    }
    if (field.maxRows !== undefined) {
        schema = schema.max(
            field.maxRows,
            `Maximum ${field.maxRows} row${field.maxRows !== 1 ? 's' : ''} allowed`
        );
    }

    if (field.required) {
        return schema;
    }

    return schema.optional().default([]);
}

/**
 * Creates Zod schema for group fields.
 * Uses passed-in schema generator to handle nested fields.
 */
export function createGroupFieldSchema(
    field: GroupField,
    fieldsToZodSchema: SchemaGenerator
): z.ZodTypeAny {
    const schema = fieldsToZodSchema(field.fields);

    if (!field.required) {
        return schema.optional();
    }

    return schema;
}
