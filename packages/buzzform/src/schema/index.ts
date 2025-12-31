/**
 * Schema utilities for BuzzForm.
 *
 * @example
 * import { createSchema } from '@buildnbuzz/buzzform';
 *
 * const loginSchema = createSchema([
 *   { type: 'email', name: 'email', required: true },
 *   { type: 'password', name: 'password', minLength: 8 },
 * ]);
 *
 * type LoginData = z.infer<typeof loginSchema>;
 */

// Main export
export { createSchema } from './create-schema';

// Core schema function
export { fieldsToZodSchema } from './fields-to-schema';

// Types re-exported from types/ folder
export type { FieldToZod, FieldsToShape, SchemaBuilder, SchemaBuilderMap } from '../types';

// Helpers for custom schema builders
export {
    extractValidationConfig,
    applyCustomValidation,
    makeOptional,
    coerceToNumber,
    coerceToDate,
    getPatternErrorMessage,
    isFileLike,
    isFileTypeAccepted,
} from './helpers';

// Individual builders for registry integration
export * from './builders';
