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

// Utilities (no external dependencies)
export { createArrayHelpers } from './utils';
