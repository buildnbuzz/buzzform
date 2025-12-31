// =============================================================================
// @buildnbuzz/buzzform
// =============================================================================

// Types - Adapter interface
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

// Types - Field definitions
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

// Types - Form configuration
export type {
    BuzzFormSchema,
    FormSettings,
    FormConfig,
    UseFormOptions,
} from './types';

// Utilities (no external dependencies)
export { createArrayHelpers } from './utils';

// Provider
export { FormProvider } from './providers/form-provider';
export { FormConfigContext } from './context/form-context';

// Hooks
export { useForm } from './hooks/use-form';

// Schema utilities
export { createSchema, fieldsToZodSchema } from './schema';
export type { FieldToZod, FieldsToShape } from './types';
