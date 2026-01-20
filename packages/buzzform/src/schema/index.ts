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

// =============================================================================
// TYPES - Adapter Interface (no runtime code, just types)
// =============================================================================
export type {
    FormState,
    SetValueOptions,
    FieldError,
    ResolverResult,
    Resolver,
    ArrayHelpers,
    AdapterOptions,
    FormAdapter,
    AdapterFactory,
} from '../types';

// =============================================================================
// TYPES - Field Definitions
// =============================================================================
export type {
    // Validation
    ValidationContext,
    ValidationResult,
    ValidationFn,

    // Conditional
    ConditionContext,
    FieldCondition,

    // Custom rendering
    FieldComponentProps,
    FieldInputProps,
    FieldInputRenderFn,

    // Styling
    FieldStyle,

    // Base
    BaseField,

    // Data fields
    TextField,
    EmailField,
    PasswordField,
    TextareaField,
    NumberField,
    DateField,
    DatetimeField,
    SelectOption,
    SelectField,
    CheckboxField,
    SwitchField,
    RadioField,
    TagsField,
    UploadField,

    // Layout fields
    GroupField,
    ArrayField,
    RowField,
    Tab,
    TabsField,
    CollapsibleField,

    // Union types
    Field,
    FieldType,
    DataField,
    LayoutField,
} from '../types';

// =============================================================================
// TYPES - Form Configuration
// =============================================================================
export type {
    BuzzFormSchema,
    FormSettings,
    FormConfig,
    UseFormOptions,
} from '../types';

// =============================================================================
// TYPES - Schema Utilities
// =============================================================================
export type {
    FieldToZod,
    FieldsToShape,
    SchemaBuilder,
    SchemaBuilderMap,
    InferType,
    InferSchema,
} from '../types';

// =============================================================================
// SCHEMA
// =============================================================================
export { createSchema } from './create-schema';
export { fieldsToZodSchema } from './fields-to-schema';

// Re-export schema helpers for advanced usage (custom field builders)
export {
    extractValidationConfig,
    makeOptional,
    coerceToNumber,
    coerceToDate,
    getPatternErrorMessage,
    isFileLike,
    isFileTypeAccepted,
    // Helpers for cross-field validation (used by zodResolver)
    collectFieldValidators,
    getSiblingData,
    getValueByPath,
    type FieldValidator,
} from './helpers';

// Individual builders for registry integration
export * from './builders';

// =============================================================================
// UTILITIES (Server-safe - no React imports)
// =============================================================================
export { createArrayHelpers } from '../utils';

// Add common utilities that registry components will need
export { generateFieldId, getNestedValue, setNestedValue, formatBytes } from '../lib';