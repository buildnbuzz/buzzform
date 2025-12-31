import { z } from 'zod';
import type { Field, FieldsToShape } from '../types';
import { fieldsToZodSchema } from './fields-to-schema';

// =============================================================================
// CREATE SCHEMA
// =============================================================================

/**
 * Creates a Zod schema from an array of field definitions.
 *
 * Uses `<const T>` to preserve literal field names for type inference.
 * The returned schema has `.fields` attached for use in rendering.
 *
 * @example
 * const loginSchema = createSchema([
 *   { type: 'email', name: 'email', required: true },
 *   { type: 'password', name: 'password', minLength: 8 },
 * ]);
 *
 * // TypeScript infers:
 * // loginSchema: ZodObject<{ email: ZodString; password: ZodString }> & { fields: [...] }
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
    fields: T
): z.ZodObject<FieldsToShape<T>> & { fields: T } {
    const schema = fieldsToZodSchema(fields);

    // Attach fields to schema for rendering access
    return Object.assign(schema, { fields }) as z.ZodObject<FieldsToShape<T>> & { fields: T };
}
