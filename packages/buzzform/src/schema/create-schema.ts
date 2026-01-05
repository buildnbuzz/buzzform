import { type z } from 'zod';
import type { Field, FieldsToShape } from '../types';
import { fieldsToZodSchema } from './fields-to-schema';

// =============================================================================
// CREATE SCHEMA
// =============================================================================

/**
 * Creates a Zod schema from an array of field definitions.
 *
 * Provides full intellisense when writing field definitions inline.
 * The returned schema has `.fields` attached for use in rendering.
 *
 * @example
 * const loginSchema = createSchema([
 *   { type: 'email', name: 'email', required: true },  // ← Full intellisense!
 *   { type: 'password', name: 'password', minLength: 8 },
 * ]);
 *
 * type LoginData = z.infer<typeof loginSchema>;
 * // { email: string; password: string }
 *
 * // Use with useForm:
 * const form = useForm({ schema: loginSchema });
 *
 * // Access fields for rendering:
 * <FormRenderer fields={loginSchema.fields} />
 */
export function createSchema<const T extends readonly Field[]>(
    fields: [...{ [K in keyof T]: T[K] extends Field ? T[K] : Field }]
): z.ZodObject<FieldsToShape<T>> & { fields: T } {
    const schema = fieldsToZodSchema(fields as T);

    // Attach fields to schema for rendering access
    return Object.assign(schema, { fields }) as z.ZodObject<FieldsToShape<T>> & { fields: T };
}
