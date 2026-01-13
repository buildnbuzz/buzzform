import { type z } from 'zod';
import type { Field, FieldsToShape } from '../types';
import type { StrictFieldArray } from '../types/strict-fields';
import { fieldsToZodSchema } from './fields-to-schema';

/**
 * Creates a Zod schema from field definitions with strict type validation.
 *
 * @example
 * const schema = createSchema([
 *   { type: 'email', name: 'email', required: true },
 *   { type: 'password', name: 'password', minLength: 8 },
 * ]);
 *
 * type FormData = z.infer<typeof schema>;
 */
export function createSchema<const T extends readonly Field[]>(
    fields: StrictFieldArray<T> & T
): z.ZodObject<FieldsToShape<T>> & { fields: T } {
    const schema = fieldsToZodSchema(fields as unknown as T);
    return Object.assign(schema, { fields }) as z.ZodObject<FieldsToShape<T>> & { fields: T };
}
