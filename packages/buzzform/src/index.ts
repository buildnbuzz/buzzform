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
    PasswordField,
    TextareaField,
    NumberField,
    DateField,
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
} from './types';

// =============================================================================
// SCHEMA
// =============================================================================
export { createSchema, fieldsToZodSchema } from './schema';

// Re-export schema helpers for advanced usage (custom field builders)
export {
    extractValidationConfig,
    applyCustomValidation,
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

// Add common utilities that registry components will need
export { generateFieldId, getNestedValue, setNestedValue, formatBytes } from './lib';

// =============================================================================
// CONTEXT & PROVIDERS
// =============================================================================
export { FormProvider } from './providers/form-provider';
export { FormConfigContext } from './context/form-context';

// =============================================================================
// HOOKS
// =============================================================================
export { useForm } from './hooks/use-form';
