import type { FormEvent } from 'react';
import type { FormSettings } from './form';

// =============================================================================
// FORM STATE
// =============================================================================

/**
 * Represents the current reactive state of a form.
 * Adapters must ensure this triggers re-renders when values change.
 * 
 * This is the MINIMUM state required for BuzzForm to work.
 * Custom adapters must provide all these properties.
 */
export interface FormState {
    /** True while the form is being submitted */
    isSubmitting: boolean;

    /** True while validation is running (async validators) */
    isValidating: boolean;

    /** True if any field has been modified from its default value */
    isDirty: boolean;

    /** True if all validations pass (no errors) */
    isValid: boolean;

    /** True while async default values are being resolved */
    isLoading: boolean;

    /** 
     * Field-level errors.
     * Key is the field path (e.g., "email", "address.city", "items.0.name")
     * Value is the error message(s)
     * 
     * NOTE: Path format uses dot notation. Array indices use numbers (items.0.name).
     */
    errors: Record<string, string | string[] | undefined>;

    /** Map of field paths to whether they've been modified */
    dirtyFields: Record<string, boolean>;

    /** Map of field paths to whether they've been touched (blurred) */
    touchedFields: Record<string, boolean>;

    /** Number of times the form has been submitted */
    submitCount: number;
}

// =============================================================================
// VALUE MANAGEMENT
// =============================================================================

/**
 * Options when programmatically setting a field value.
 */
export interface SetValueOptions {
    /** Run validation after setting the value (default: adapter-specific) */
    shouldValidate?: boolean;

    /** Mark the field as dirty (default: true) */
    shouldDirty?: boolean;

    /** Mark the field as touched (default: false) */
    shouldTouch?: boolean;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Represents a field-level error.
 */
export interface FieldError {
    /** Error type (e.g., 'required', 'pattern', 'server', 'custom') */
    type?: string;

    /** Human-readable error message */
    message: string;
}

/**
 * Result from a validation resolver.
 */
export interface ResolverResult<TData> {
    /** Parsed/transformed values (if validation passes) */
    values?: TData;

    /** Field errors (if validation fails) */
    errors?: Record<string, FieldError>;
}

/**
 * A validation resolver function.
 * Adapters use this to validate form values against a schema.
 * 
 * @example
 * // Zod resolver
 * const zodResolver = (schema) => async (values) => {
 *   const result = schema.safeParse(values);
 *   if (result.success) return { values: result.data };
 *   return { errors: mapZodErrors(result.error) };
 * };
 */
export type Resolver<TData> = (
    values: TData
) => Promise<ResolverResult<TData>> | ResolverResult<TData>;

// =============================================================================
// ARRAY HELPERS
// =============================================================================

/**
 * Helper methods for manipulating array fields.
 * All methods operate on a field path (e.g., "items", "users.0.tags").
 * 
 * This is REQUIRED for ArrayField to work. If your custom adapter doesn't
 * support arrays, you can implement these as no-ops or throw errors.
 */
export interface ArrayHelpers {
    /**
     * Get array items with stable IDs for React keys.
     * @param path - Field path to the array
     * @returns Array of items, each with an `id` property for React keys
     */
    fields: <T = unknown>(path: string) => Array<T & { id: string }>;

    /**
     * Add an item to the end of the array.
     */
    append: (path: string, value: unknown) => void;

    /**
     * Add an item to the beginning of the array.
     */
    prepend: (path: string, value: unknown) => void;

    /**
     * Insert an item at a specific index.
     */
    insert: (path: string, index: number, value: unknown) => void;

    /**
     * Remove an item at a specific index.
     */
    remove: (path: string, index: number) => void;

    /**
     * Move an item from one index to another.
     * Used for drag-and-drop reordering.
     */
    move: (path: string, from: number, to: number) => void;

    /**
     * Swap two items by their indices.
     */
    swap: (path: string, indexA: number, indexB: number) => void;

    /**
     * Replace the entire array with new values.
     */
    replace: (path: string, values: unknown[]) => void;

    /**
     * Update an item at a specific index.
     */
    update: (path: string, index: number, value: unknown) => void;
}

// =============================================================================
// ADAPTER OPTIONS
// =============================================================================

/**
 * Base options passed to any adapter when creating a form instance.
 * Adapters can extend this with library-specific options.
 * 
 * @typeParam TData - The shape of form data
 */
export interface AdapterOptions<TData = Record<string, unknown>> {
    /**
     * Initial values for the form.
     * Can be:
     * - A static object
     * - A sync function returning values
     * - An async function returning values (form shows loading state)
     */
    defaultValues?: TData | (() => TData) | (() => Promise<TData>);

    /**
     * Controlled values - when provided, form becomes controlled.
     * Changes to this prop will update form values.
     */
    values?: TData;

    /**
     * Validation resolver.
     * Called to validate form values before submission and optionally on change/blur.
     */
    resolver?: Resolver<TData>;

    /**
     * When to run validation.
     * - 'onChange': Validate on every value change
     * - 'onBlur': Validate when fields lose focus
     * - 'onSubmit': Validate only on submit
     * - 'all': Validate on all events
     * 
     * NOTE: Not all adapters support all modes. Check adapter documentation.
     */
    mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'all';

    /**
     * When to re-validate after initial error.
     * NOTE: This is optional. Some form libraries don't have this concept.
     */
    reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';

    /**
     * Callback when form is submitted (after validation passes).
     */
    onSubmit?: (values: TData) => Promise<void> | void;
}

// =============================================================================
// FORM ADAPTER INTERFACE
// =============================================================================

/**
 * The contract any form adapter must fulfill.
 * 
 * ## Required vs Optional
 * 
 * **Required methods** are the building blocks that BuzzForm needs to function.
 * If any are missing, forms will break.
 * 
 * **Optional methods** (marked with `?`) provide enhanced functionality but
 * are not required. BuzzForm will gracefully degrade without them.
 * 
 * ## Creating a Custom Adapter
 * 
 * To create a custom adapter (e.g., for useActionState, Formik, or vanilla React):
 * 
 * 1. Implement all required properties and methods
 * 2. Optionally implement enhanced features
 * 3. Return the adapter from a hook (factory function)
 * 
 * @example
 * // Minimal custom adapter skeleton
 * function useMyAdapter<T>(options: AdapterOptions<T>): FormAdapter<T> {
 *   const [values, setValues] = useState(options.defaultValues ?? {});
 *   const [errors, setErrors] = useState({});
 *   const [isSubmitting, setIsSubmitting] = useState(false);
 *   
 *   return {
 *     control: null, // Your state/context
 *     get formState() { return { ... } },
 *     handleSubmit: async (e) => { ... },
 *     getValues: () => values,
 *     setValue: (name, value) => { ... },
 *     reset: (vals) => setValues(vals ?? {}),
 *     watch: (name) => name ? values[name] : values,
 *     validate: async () => true,
 *     setError: (name, error) => { ... },
 *     clearErrors: () => setErrors({}),
 *     array: createArrayHelpers(...),
 *   };
 * }
 * 
 * @typeParam TData - The shape of form data
 */
export interface FormAdapter<TData = Record<string, unknown>> {
    // =========================================================================
    // CORE PROPERTIES (Required)
    // =========================================================================

    /**
     * Form-level behavior settings.
     * Set by useForm after applying FormSettings.
     */
    settings?: FormSettings;

    /**
     * The underlying form library's control/instance.
     * 
     * This is passed to field components that need direct access to the form
     * library (e.g., for React Hook Form's Controller).
     * 
     * For custom adapters, this can be:
     * - Your state object
     * - A context value
     * - null (if not needed)
     */
    control: unknown;

    /**
     * Current form state.
     * MUST be implemented as a getter to ensure reactivity.
     * 
     * @example
     * get formState() {
     *   return {
     *     isSubmitting: this._isSubmitting,
     *     isValidating: false,
     *     isDirty: Object.keys(this._touched).length > 0,
     *     isValid: Object.keys(this._errors).length === 0,
     *     isLoading: false,
     *     errors: this._errors,
     *     dirtyFields: this._dirty,
     *     touchedFields: this._touched,
     *     submitCount: this._submitCount,
     *   };
     * }
     */
    formState: FormState;

    /**
     * Submit handler to attach to a form element.
     * Should prevent default, run validation, and call onSubmit if valid.
     * 
     * @example
     * <form onSubmit={adapter.handleSubmit}>
     */
    handleSubmit: (e?: FormEvent) => Promise<void> | void;

    // =========================================================================
    // VALUE MANAGEMENT (Required)
    // =========================================================================

    /**
     * Get all current form values.
     */
    getValues: () => TData;

    /**
     * Set a single field's value.
     * 
     * @param name - Field path (e.g., "email", "address.city", "items.0.name")
     * @param value - New value
     * @param options - Additional options
     */
    setValue: (
        name: string,
        value: unknown,
        options?: SetValueOptions
    ) => void;

    /**
     * Reset form to default values or provided values.
     * 
     * @param values - Optional new values to reset to
     */
    reset: (values?: Partial<TData>) => void;

    /**
     * Watch one or more field values reactively.
     * Returns current value(s) and causes re-render when they change.
     * 
     * @param name - Field path to watch, or undefined for all values
     * @returns Current value(s)
     */
    watch: <T = unknown>(name?: string) => T;

    // =========================================================================
    // VALIDATION (Required)
    // =========================================================================

    /**
     * Manually trigger validation.
     * 
     * @param name - Field(s) to validate, or undefined for entire form
     * @returns True if validation passes
     */
    validate: (name?: string | string[]) => Promise<boolean>;

    /**
     * Set a field error programmatically.
     * Useful for server-side validation errors.
     * 
     * @param name - Field path
     * @param error - Error details
     */
    setError: (name: string, error: FieldError) => void;

    /**
     * Clear validation errors.
     * 
     * @param name - Field(s) to clear, or undefined for all errors
     */
    clearErrors: (name?: string | string[]) => void;

    // =========================================================================
    // ARRAYS (Required for ArrayField)
    // =========================================================================

    /**
     * Helpers for manipulating array fields.
     * Required if you use ArrayField component.
     */
    array: ArrayHelpers;

    // =========================================================================
    // OPTIONAL ENHANCED FEATURES
    // These provide better UX but are not required for basic functionality.
    // =========================================================================

    /**
     * Handle field blur event.
     * Triggers validation if mode is 'onBlur'.
     * 
     * If not provided, BuzzForm will not trigger blur-based validation.
     * 
     * @param name - Field path
     */
    onBlur?: (name: string) => void;

    /**
     * Get the state of a specific field.
     * More efficient than accessing the entire formState for single fields.
     * 
     * @param name - Field path
     */
    getFieldState?: (name: string) => {
        isDirty: boolean;
        isTouched: boolean;
        invalid: boolean;
        error?: string;
    };

    /**
     * Programmatically focus a field.
     * Useful for accessibility and after adding array items.
     * 
     * @param name - Field path
     * @param options - Focus options
     */
    setFocus?: (name: string, options?: { shouldSelect?: boolean }) => void;

    /**
     * Unregister a field from the form.
     * Called when conditional fields are hidden.
     * 
     * If not provided, hidden fields will retain their values.
     * 
     * @param name - Field path(s) to unregister
     */
    unregister?: (name: string | string[]) => void;
}

// =============================================================================
// ADAPTER FACTORY TYPE
// =============================================================================

/**
 * Type for an adapter factory function (hook).
 * 
 * @example
 * // Using the adapter
 * function MyApp() {
 *   return (
 *     <FormProvider adapter={useRhfAdapter}>
 *       <MyForm />
 *     </FormProvider>
 *   );
 * }
 */
export type AdapterFactory<TData = Record<string, unknown>> = (
    options: AdapterOptions<TData>
) => FormAdapter<TData>;

// =============================================================================
// VALIDATION HELPERS FOR CUSTOM ADAPTERS
// =============================================================================

/**
 * Validates that a FormAdapter has all required methods.
 * Call this in development to catch missing implementations early.
 * 
 * @param adapter - The adapter to validate
 * @param adapterName - Name for error messages
 * @throws Error if required methods are missing
 */
export function validateAdapter(adapter: FormAdapter, adapterName = 'adapter'): void {
    const required = [
        'control',
        'formState',
        'handleSubmit',
        'getValues',
        'setValue',
        'reset',
        'watch',
        'validate',
        'setError',
        'clearErrors',
        'array',
    ] as const;

    for (const key of required) {
        if (adapter[key] === undefined) {
            throw new Error(
                `Invalid FormAdapter: "${adapterName}" is missing required property "${key}". ` +
                `See FormAdapter interface for implementation requirements.`
            );
        }
    }

    // Validate array helpers
    const arrayMethods = [
        'fields', 'append', 'prepend', 'insert',
        'remove', 'move', 'swap', 'replace', 'update'
    ] as const;

    for (const method of arrayMethods) {
        if (typeof adapter.array[method] !== 'function') {
            throw new Error(
                `Invalid FormAdapter: "${adapterName}.array.${method}" must be a function.`
            );
        }
    }
}
