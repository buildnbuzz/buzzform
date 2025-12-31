import type { z } from 'zod';
import type { Field } from './field';

// =============================================================================
// TYPE-LEVEL MAPPING: Field → Zod Type
// =============================================================================

/**
 * Maps a BuzzForm field definition to its corresponding Zod type.
 * Used for type inference in createSchema.
 *
 * Order matters for conditional types - more specific matches first.
 */
export type FieldToZod<F extends Field> =
    // If field has an explicit schema, use it
    F extends { schema: infer S extends z.ZodTypeAny } ? S :
    // Text-like fields with hasMany
    F extends { type: 'text'; hasMany: true } ? z.ZodArray<z.ZodString> :
    F extends { type: 'email'; hasMany: true } ? z.ZodArray<z.ZodString> :
    // Text-like fields (single)
    F extends { type: 'text' } ? z.ZodString :
    F extends { type: 'email' } ? z.ZodString :
    F extends { type: 'password' } ? z.ZodString :
    F extends { type: 'textarea' } ? z.ZodString :
    // Number
    F extends { type: 'number' } ? z.ZodNumber :
    // Date
    F extends { type: 'date' } ? z.ZodDate :
    F extends { type: 'datetime' } ? z.ZodDate :
    // Boolean
    F extends { type: 'checkbox' } ? z.ZodBoolean :
    F extends { type: 'switch' } ? z.ZodBoolean :
    // Select with hasMany - uses union type (string | number | boolean)
    F extends { type: 'select'; hasMany: true } ? z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>> :
    F extends { type: 'select' } ? z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]> :
    // Radio - uses union type (string | number | boolean)
    F extends { type: 'radio' } ? z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]> :
    // Tags (always array of strings)
    F extends { type: 'tags' } ? z.ZodArray<z.ZodString> :
    // Upload
    F extends { type: 'upload'; hasMany: true } ? z.ZodArray<z.ZodUnion<[z.ZodType<File>, z.ZodString]>> :
    F extends { type: 'upload' } ? z.ZodUnion<[z.ZodType<File>, z.ZodString]> :
    // Fallback
    z.ZodTypeAny;

// =============================================================================
// TYPE-LEVEL MAPPING: Fields Array → Object Shape
// =============================================================================

/**
 * Transforms an array of field definitions into the shape of a Zod object.
 * Only includes fields with a `name` property (data fields).
 *
 * Uses the `const T` generic to preserve literal field names.
 *
 * @example
 * const fields = [
 *   { type: 'text', name: 'email' },
 *   { type: 'number', name: 'age' },
 * ] as const;
 *
 * type Shape = FieldsToShape<typeof fields>;
 * // { email: z.ZodString; age: z.ZodNumber }
 */
export type FieldsToShape<T extends readonly Field[]> = {
    [K in T[number]as K extends { name: infer N extends string } ? N : never]:
    K extends { name: string } ? FieldToZod<K> : never
};

// =============================================================================
// SCHEMA BUILDER TYPE
// =============================================================================

/**
 * Function signature for field schema builders.
 * Each field type has a builder that converts the field config to a Zod schema.
 */
export type SchemaBuilder<TField extends Field = Field> = (field: TField) => z.ZodTypeAny;

/**
 * Map of field types to their schema builders.
 */
export type SchemaBuilderMap = Partial<Record<Field['type'], SchemaBuilder<any>>>;
