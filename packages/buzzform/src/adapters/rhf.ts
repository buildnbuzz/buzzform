'use client';

import { useRef, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type {
    Control,
    FieldValues,
    Path,
    PathValue,
    DefaultValues,
    FieldErrors,
    Resolver as RhfResolver
} from 'react-hook-form';
import type {
    FormAdapter,
    AdapterOptions,
    FormState,
    FieldError,
    SetValueOptions,
} from '../types';
import { createArrayHelpers } from '../utils';
import { getNestedValue, flattenNestedObject } from '../lib';

// =============================================================================
// RHF ADAPTER OPTIONS
// =============================================================================

/**
 * Options specific to the React Hook Form adapter.
 * Extends base AdapterOptions with RHF-specific features.
 */
export interface RhfAdapterOptions<TData extends FieldValues = FieldValues>
    extends AdapterOptions<TData> {
    /**
     * React Hook Form's reValidateMode.
     * When to re-validate after initial validation.
     * @default 'onChange'
     */
    reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';

    /**
     * Validation strategy before submit.
     * - 'firstError': Return first error only (faster)
     * - 'all': Return all errors (better UX for complex forms)
     * @default 'firstError'
     */
    criteriaMode?: 'firstError' | 'all';

    /**
     * Delay validation by specified ms (debounce).
     * Useful for expensive async validation.
     */
    delayError?: number;

    /**
     * Focus on the first field with an error after submit.
     * @default true
     */
    shouldFocusError?: boolean;
}

// =============================================================================
// RHF ADAPTER
// =============================================================================

/**
 * React Hook Form adapter implementing the FormAdapter interface.
 * 
 * This is the default adapter for BuzzForm. It provides full implementation
 * of all required and optional FormAdapter methods using React Hook Form.
 * 
 * @example
 * // In FormProvider
 * import { useRhf } from '@buildnbuzz/buzzform/rhf';
 * 
 * <FormProvider adapter={useRhf}>
 *   <App />
 * </FormProvider>
 * 
 * @example
 * // Direct usage
 * const form = useRhf({
 *   defaultValues: { email: '', password: '' },
 *   resolver: zodResolver(schema),
 *   onSubmit: async (data) => {
 *     await loginUser(data);
 *   },
 * });
 */
export function useRhf<TData extends FieldValues = FieldValues>(
    options: RhfAdapterOptions<TData>
): FormAdapter<TData> {
    const {
        defaultValues,
        values,
        resolver,
        mode = 'onChange',
        reValidateMode = 'onChange',
        criteriaMode,
        delayError,
        shouldFocusError = true,
        onSubmit,
    } = options;

    // -------------------------------------------------------------------------
    // Initialize React Hook Form
    // -------------------------------------------------------------------------

    const form = useForm<TData>({
        defaultValues: defaultValues as DefaultValues<TData>,
        values: values,
        resolver: resolver as unknown as RhfResolver<TData>,
        mode,
        reValidateMode,
        criteriaMode,
        delayError,
        shouldFocusError,
    });

    // -------------------------------------------------------------------------
    // Handle controlled values updates
    // -------------------------------------------------------------------------

    const prevValuesRef = useRef(values);

    useEffect(() => {
        if (values && JSON.stringify(values) !== JSON.stringify(prevValuesRef.current)) {
            prevValuesRef.current = values;
        }
    }, [values]);

    // -------------------------------------------------------------------------
    // Build submit handler
    // -------------------------------------------------------------------------

    const handleSubmit = form.handleSubmit(async (data) => {
        if (onSubmit) {
            await onSubmit(data as TData);
        }
    });

    // -------------------------------------------------------------------------
    // Build the adapter API
    // -------------------------------------------------------------------------

    const api: FormAdapter<TData> = {
        // ---------------------------------------------------------------------
        // CORE PROPERTIES
        // ---------------------------------------------------------------------

        control: form.control,

        get formState(): FormState {
            const state = form.formState;
            return {
                isSubmitting: state.isSubmitting,
                isValidating: state.isValidating,
                isDirty: state.isDirty,
                isValid: state.isValid,
                isLoading: state.isLoading,
                errors: normalizeErrors(state.errors),
                dirtyFields: flattenNestedObject(state.dirtyFields),
                touchedFields: flattenNestedObject(state.touchedFields),
                submitCount: state.submitCount,
            };
        },

        handleSubmit,

        // ---------------------------------------------------------------------
        // VALUE MANAGEMENT
        // ---------------------------------------------------------------------

        getValues: () => form.getValues(),

        setValue: (name: string, value: unknown, opts?: SetValueOptions) => {
            form.setValue(name as Path<TData>, value as PathValue<TData, Path<TData>>, {
                shouldValidate: opts?.shouldValidate,
                shouldDirty: opts?.shouldDirty ?? true,
                shouldTouch: opts?.shouldTouch,
            });
        },

        reset: (vals) => form.reset(vals as DefaultValues<TData>),

        watch: <T = unknown>(name?: string): T => {
            return form.watch(name as Path<TData>) as T;
        },

        // ---------------------------------------------------------------------
        // VALIDATION
        // ---------------------------------------------------------------------

        validate: async (name) => {
            if (name) {
                const names = Array.isArray(name) ? name : [name];
                return form.trigger(names as Path<TData>[]);
            }
            return form.trigger();
        },

        setError: (name: string, error: FieldError) => {
            form.setError(name as Path<TData>, {
                type: error.type || 'manual',
                message: error.message,
            });
        },

        clearErrors: (name) => {
            if (name) {
                const names = Array.isArray(name) ? name : [name];
                names.forEach(n => form.clearErrors(n as Path<TData>));
            } else {
                form.clearErrors();
            }
        },

        // ---------------------------------------------------------------------
        // ARRAYS
        // ---------------------------------------------------------------------

        array: createArrayHelpers(
            (path) => form.getValues(path as Path<TData>) as unknown[],
            (path, value) => form.setValue(
                path as Path<TData>,
                value as PathValue<TData, Path<TData>>,
                { shouldDirty: true }
            )
        ),

        // ---------------------------------------------------------------------
        // OPTIONAL ENHANCED FEATURES
        // ---------------------------------------------------------------------

        onBlur: (name: string) => {
            // Mark field as touched
            const hasError = !!getNestedValue(form.formState.errors, name);

            // Trigger validation based on mode
            if (mode === 'onBlur' || mode === 'all') {
                form.trigger(name as Path<TData>);
            } else if (hasError && reValidateMode === 'onBlur') {
                // Re-validate if field has error and reValidateMode is onBlur
                form.trigger(name as Path<TData>);
            }
        },

        getFieldState: (name: string) => {
            const state = form.getFieldState(name as Path<TData>, form.formState);
            return {
                isDirty: state.isDirty,
                isTouched: state.isTouched,
                invalid: state.invalid,
                error: state.error?.message,
            };
        },

        setFocus: (name: string, options?: { shouldSelect?: boolean }) => {
            form.setFocus(name as Path<TData>, options);
        },

        unregister: (name: string | string[]) => {
            const names = Array.isArray(name) ? name : [name];
            names.forEach(n => form.unregister(n as Path<TData>));
        },
    };

    return api;
}

// =============================================================================
// HELPER: Watch hook for external use
// =============================================================================

/**
 * Hook to watch specific field values reactively.
 * Use this when you need to react to field changes outside of components.
 * 
 * @param control - The control object from useRhf (form.control)
 * @param name - Field path(s) to watch
 */
export function useRhfWatch<TData extends FieldValues, TValue = unknown>(
    control: Control<TData>,
    name: string | string[]
): TValue {
    if (Array.isArray(name)) {
        return useWatch({ control, name: name as unknown as Path<TData>[] }) as TValue;
    }
    return useWatch({ control, name: name as Path<TData> }) as TValue;
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Normalize RHF's nested error structure to flat string map.
 */
function normalizeErrors<TData extends FieldValues>(
    errors: FieldErrors<TData>
): Record<string, string | string[] | undefined> {
    const result: Record<string, string | string[] | undefined> = {};

    function traverse(obj: Record<string, unknown>, prefix = '') {
        for (const key in obj) {
            const path = prefix ? `${prefix}.${key}` : key;
            const value = obj[key];

            if (isRecord(value) && 'message' in value && typeof value.message === 'string') {
                // Leaf error
                result[path] = value.message;
            } else if (
                isRecord(value) &&
                'root' in value &&
                isRecord(value.root) &&
                'message' in value.root &&
                typeof value.root.message === 'string'
            ) {
                // Array root error
                result[path] = value.root.message;
            } else if (isRecord(value)) {
                // Nested object, traverse deeper
                traverse(value, path);
            }
        }
    }

    traverse(errors as unknown as Record<string, unknown>);
    return result;
}



function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

// =============================================================================
// RE-EXPORTS FOR CONVENIENCE
// =============================================================================

export type { UseFormReturn as RhfForm } from 'react-hook-form';