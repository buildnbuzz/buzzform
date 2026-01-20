// =============================================================================
// @buildnbuzz/buzzform
// =============================================================================

// =============================================================================
// TYPES - Adapter Interface
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
} from './types';

// Adapter validation helper (for custom adapter authors)
export { validateAdapter } from './types';

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
} from './types';

// =============================================================================
// TYPES - Form Configuration
// =============================================================================
export type {
    BuzzFormSchema,
    FormSettings,
    FormConfig,
    UseFormOptions,
} from './types';

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
} from './types';

// =============================================================================
// SCHEMA
// =============================================================================
export { createSchema, fieldsToZodSchema } from './schema';

// Re-export schema helpers for advanced usage (custom field builders)
export {
    extractValidationConfig,
    makeOptional,
    coerceToNumber,
    coerceToDate,
    getPatternErrorMessage,
    isFileLike,
    isFileTypeAccepted,
} from './schema';

// =============================================================================
// UTILITIES
// =============================================================================
export { createArrayHelpers } from './utils';

// Common utilities for registry components
export { generateFieldId, getNestedValue, setNestedValue, formatBytes } from './lib';

// Field utilities for nested fields, error counting, and dynamic state
export {
    getNestedFieldPaths,
    countNestedErrors,
    resolveFieldState,
    getArrayRowLabel,
} from './lib';

// Field style utilities
export { getFieldWidthStyle } from './lib';

// Select option utilities
export {
    normalizeSelectOption,
    getSelectOptionValue,
    getSelectOptionLabel,
    getSelectOptionLabelString,
    isSelectOptionDisabled,
} from './lib';

// Number utilities
export {
    clampNumber,
    applyNumericPrecision,
    formatNumberWithSeparator,
    parseFormattedNumber,
} from './lib';

// Date utilities
export { parseToDate } from './lib';

// =============================================================================
// CONTEXT & PROVIDERS
// =============================================================================
export { FormProvider } from './providers/form-provider';
export { FormConfigContext } from './context/form-context';

// =============================================================================
// HOOKS
// =============================================================================
export { useForm } from './hooks/use-form';
